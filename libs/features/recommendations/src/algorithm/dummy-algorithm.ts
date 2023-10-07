import { FriendshipType } from '@Feature/friendships/dtos';
import { ResourceTypeRelevance } from '@Feature/interests/enums/resource-type-relevance.enum';
import { ResourceType } from '@Feature/interests/enums/resource-type.enum';
import { Recommendation, InterestScores } from '../recommendation.entity';
import { RecommendationAlgorithm } from './algorithm.interface';
import { FriendshipsService } from '@Feature/friendships/friendships.service';
import { InterestsService } from '@Feature/interests';
import { UsersService } from '@Feature/users';
import { InterestRelevance } from '@Feature/interests/entities/interest.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DummyAlgorithm implements RecommendationAlgorithm {
  private interestRelevanceWeight = {
    [InterestRelevance.NORMAL]: 1,
    [InterestRelevance.FAVORITE]: 2,
  };

  private typeRelevanceWeight = {
    [ResourceTypeRelevance.LOW]: 0.5,
    [ResourceTypeRelevance.NORMAL]: 1,
    [ResourceTypeRelevance.HIGH]: 2,
  };

  constructor(
    private usersService: UsersService,
    private interestsService: InterestsService,
    private friendshipsService: FriendshipsService,
  ) {}

  public async calculateRecommendations(
    targetUserId: string,
  ): Promise<Recommendation[]> {
    const targetUser = await this.usersService.getUserEntity(targetUserId);
    if (!targetUser) {
      throw Error('Invalid target user id');
    }

    const friends = await this.friendshipsService.getFriendships(
      targetUserId,
      FriendshipType.ESTABLISHED,
    );

    const discardUserIds = [...friends, targetUserId];

    // Now we will bring all users, but then we may only bring
    // the ones that are nearest based on Big Five model
    // also we may apply filters based on preferences

    const userIds = await this.usersService.getAllUserIds(
      targetUser.preferences?.filters,
    );

    const results: Recommendation[] = [];

    // Calculate score for each user

    for (const userId of userIds) {
      if (discardUserIds.includes(userId)) continue;

      // Get the interest score

      const interestsScore = await this.getInterestScore(
        targetUserId,
        userId,
        targetUser.preferences?.typeRelevances,
      );

      // TODO: Calculate Big Five score

      // Ponderate the scores to obtain final score

      const finalScore = interestsScore.global;

      // Create the recommendation object

      results.push({
        targetUserId: targetUserId,
        recommendedUserId: userId,
        scores: {
          global: finalScore,
          interests: interestsScore,
        },
      });
    }

    // Sort them descending and choose the best

    results.sort((r1, r2) => r2.scores.global - r1.scores.global);

    return results;
  }

  private async getInterestScore(
    forUserId: string,
    withUserId: string,
    userTypeRelevances?: Map<ResourceType, ResourceTypeRelevance>,
  ): Promise<InterestScores> {
    const sharedWeightsSum = {
      [ResourceType.ARTIST]: 0,
      [ResourceType.TRACK]: 0,
    };

    const res = await this.interestsService.getSharedInterests(
      forUserId,
      withUserId,
    );

    for (const sharedInterest of res.sharedInterests) {
      const type = sharedInterest.resource.type;
      const wa = this.interestRelevanceWeight[sharedInterest.relevanceForUserA];
      const wb = this.interestRelevanceWeight[sharedInterest.relevanceForUserB];
      sharedWeightsSum[type] += (wa + wb) / 2;
    }

    let ponderatedWeight = 0;

    const artistRelevance =
      userTypeRelevances?.[ResourceType.ARTIST] ?? ResourceTypeRelevance.NORMAL;
    ponderatedWeight +=
      this.typeRelevanceWeight[artistRelevance] *
      sharedWeightsSum[ResourceType.ARTIST];

    const trackRelevance =
      userTypeRelevances?.[ResourceType.TRACK] ?? ResourceTypeRelevance.NORMAL;
    ponderatedWeight +=
      this.typeRelevanceWeight[trackRelevance] *
      sharedWeightsSum[ResourceType.TRACK];

    return {
      ...sharedWeightsSum,
      global: ponderatedWeight,
    };
  }
}
