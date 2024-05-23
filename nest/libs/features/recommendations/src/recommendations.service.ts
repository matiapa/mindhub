import { Injectable } from '@nestjs/common';
import { RecommendationRepository } from './recommendation.repository';
import { ReviewRecommendationReqDto } from './dtos/review-recommendation.dto';
import { FriendshipsService } from '@Feature/friendships/friendships.service';
import {
  GetRecommendationsReqDto,
  GetRecommendationsResDto,
} from './dtos/get-recommendations.dto';
import { SharedUserInfo, SharedUserInfoConfig, UsersService } from '@Feature/users';

@Injectable()
export class RecommendationsService {
  constructor(
    private recommendationRepo: RecommendationRepository,
    private friendshipService: FriendshipsService,
    private usersService: UsersService,
  ) {}

  public async getRecommendations(
    dto: GetRecommendationsReqDto,
    targetUserId: string,
    userInfoConfig: SharedUserInfoConfig,
  ): Promise<GetRecommendationsResDto> {
    // TODO: Handle priority setting

    const recommendations = await this.recommendationRepo.getPaginated(
      {
        offset: dto.offset,
        limit: dto.limit,
        sortBy: 'score.global',
        sortOrder: 'desc',
      },
      {
        targetUserId,
        reviewed: { $exists: false },
      },
    );
    const ids = recommendations.map(r => r.recommendedUserId)

    const users = await this.usersService.getManySharedUserInfo(ids, targetUserId, userInfoConfig);

    return {
      recommendations: recommendations.map((r, i) => ({
        user: users[i],
        score: r.score,
      })),
      count: recommendations.length,
      total: await this.recommendationRepo.count({
        targetUserId,
        reviewed: { $exists: false },
      }),
    };
  }

  public async reviewRecommendation(
    targetUserId: string,
    recommendedUserId: string,
    dto: ReviewRecommendationReqDto,
  ): Promise<void> {
    await this.recommendationRepo.updateOne(
      { targetUserId, recommendedUserId },
      {
        reviewed: {
          accepted: dto.accept,
          date: new Date().toISOString(),
        },
      },
    );

    if (dto.accept) {
      await this.friendshipService.proposeFriendship(
        targetUserId,
        recommendedUserId,
      );
    }
  }
}
