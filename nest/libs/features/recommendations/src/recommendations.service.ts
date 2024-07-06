import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RecommendationRepository } from './recommendation.repository';
import { ReviewRecommendationReqDto } from './dtos/review-recommendation.dto';
import { FriendshipsService } from '@Feature/friendships/friendships.service';
import {
  GetRecommendationsReqDto,
  GetRecommendationsResDto,
} from './dtos/get-recommendations.dto';
import { SharedUserInfo, SharedUserInfoConfig, UsersService } from '@Feature/users';
import { RecommendationPriority } from './enums/recommendation-priority.enum';

@Injectable()
export class RecommendationsService {
  constructor(
    private recommendationRepo: RecommendationRepository,
    @Inject(forwardRef(() => FriendshipsService))
    private friendshipService: FriendshipsService,
    private usersService: UsersService,
  ) {}

  public async getRecommendations(
    dto: GetRecommendationsReqDto,
    targetUserId: string,
    userInfoConfig: SharedUserInfoConfig,
  ): Promise<GetRecommendationsResDto> {
    /* TODO: When dont apply pagination on the database query because when
      sorting by distance or activity we must do it after the query, since
      that information is not available. See if we can improve this */

    const recommendations = await this.recommendationRepo.getMany({
      targetUserId,
      reviewed: { $exists: false },
    });
    const ids = recommendations.map((r) => r.recommendedUserId);

    const users = await this.usersService.getManySharedUserInfo(
      ids,
      targetUserId,
      userInfoConfig,
    );

    let recommendationsWithUser = recommendations.map((r, i) => ({
      user: users[i],
      score: r.score,
    }));

    const compare = (a: SharedUserInfo, b: SharedUserInfo, untieValue: number) => (
      a.isFake && !b.isFake ? 1 : !a.isFake && b.isFake ? -1 : untieValue
    )

    if (dto.priority === RecommendationPriority.AFFINITY)
      recommendationsWithUser.sort((a, b) => compare(a.user, b.user, b.score.global - a.score.global));
    else if (dto.priority === RecommendationPriority.DISTANCE)
      recommendationsWithUser.sort((a, b) => compare(a.user, b.user, a.user.distance - b.user.distance));
    else if (dto.priority === RecommendationPriority.ACTIVITY)
      recommendationsWithUser.sort((a, b) => compare(a.user, b.user, a.user.inactiveHours - b.user.inactiveHours));

    recommendationsWithUser = recommendationsWithUser.splice(
      dto.offset,
      dto.limit,
    );

    return {
      recommendations: recommendationsWithUser,
      count: recommendationsWithUser.length,
      total: await this.recommendationRepo.count({
        targetUserId,
        reviewed: { $exists: false },
      }),
    };
  }

  public async getRecommendation(
    targetUserId: string,
    recommendedUserId: string,
  ) {
    return this.recommendationRepo.getOne({ targetUserId, recommendedUserId });
  }

  public async reviewRecommendation(
    targetUserId: string,
    recommendedUserId: string,
    dto: ReviewRecommendationReqDto,
    sendFriendship: boolean = true,
  ): Promise<void> {
    const result = await this.recommendationRepo.updateOne(
      { targetUserId, recommendedUserId },
      {
        reviewed: {
          accepted: dto.accept,
          date: new Date().toISOString(),
        },
      },
    );

    if (dto.accept && sendFriendship) {
      await this.friendshipService.proposeFriendship(
        targetUserId,
        recommendedUserId,
      );
    }
  }
}
