import { Injectable } from '@nestjs/common';
import { RecommendationRepository } from './recommendation.repository';
import { ReviewRecommendationReqDto } from './dtos/review-recommendation.dto';
import { FriendshipsService } from '@Feature/friendships/friendships.service';
import {
  GetRecommendationsReqDto,
  GetRecommendationsResDto,
} from './dtos/get-recommendations.dto';

@Injectable()
export class RecommendationsService {
  constructor(
    private recommendationRepo: RecommendationRepository,
    private friendshipService: FriendshipsService,
  ) {}

  public async getRecommendations(
    dto: GetRecommendationsReqDto,
    targetUserId: string,
  ): Promise<GetRecommendationsResDto> {
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

    return {
      recommendations: recommendations.map((r) => ({
        recommendedUserId: r.recommendedUserId,
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
