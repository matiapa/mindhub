import { FriendshipType } from '@Feature/friendships/dtos';
import { FriendshipsService } from '@Feature/friendships/friendships.service';
import { InterestsService } from '@Feature/interests';
import { InterestRelevance } from '@Feature/interests/interest.entity';
import { ResourceType } from '@Feature/resources/enums';
import { ResourceTypeRelevance } from '@Feature/resources/enums/resource-type-relevance.enum';
import { UsersService } from '@Feature/users';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RecommendationsService {
  constructor(
    private usersService: UsersService,
    private interestsService: InterestsService,
    private friendshipsService: FriendshipsService,
  ) {}

  private interestRelevanceWeight = {
    [InterestRelevance.NORMAL]: 1,
    [InterestRelevance.FAVORITE]: 2,
  };

  private typeRelevanceWeight = {
    [ResourceTypeRelevance.LOW]: 0.5,
    [ResourceTypeRelevance.NORMAL]: 1,
    [ResourceTypeRelevance.HIGH]: 2,
  };

  public async getReccomendations(targetUserId: string) {
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

    const scores: any[] = [];

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

      const finalScore = interestsScore;

      scores.push({ userId, value: finalScore });
    }

    // Sort them descending and choose the best

    scores.sort((s1, s2) => s2.value - s1.value);

    return scores;
  }

  private async getInterestScore(
    forUserId: string,
    withUserId: string,
    userTypeRelevances?: Map<ResourceType, ResourceTypeRelevance>,
  ): Promise<number> {
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

    return ponderatedWeight;
  }
}
