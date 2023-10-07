import { Injectable } from '@nestjs/common';
import { RecommendationRepository } from './recommendation.repository';
import { RecommendationAlgorithm } from './algorithm/algorithm.interface';
import { Recommendation } from './recommendation.entity';
import { DummyAlgorithm } from './algorithm/dummy-algorithm';

@Injectable()
export class RecommendationsService {
  private recommendationAlgorithm: RecommendationAlgorithm;

  constructor(
    private recommendationRepo: RecommendationRepository,
    dummyAlgorithm: DummyAlgorithm,
  ) {
    this.recommendationAlgorithm = dummyAlgorithm;
  }

  public async generateRecommendations(targetUserId: string): Promise<void> {
    const recommendations =
      await this.recommendationAlgorithm.calculateRecommendations(targetUserId);

    await this.recommendationRepo.createMany(recommendations);
  }

  public async getRecommendations(
    targetUserId: string,
  ): Promise<Recommendation[]> {
    return this.recommendationRepo.getByTargetUser(targetUserId);
  }

  public async discardRecommendation(
    targetUserId: string,
    recommendedUserId: string,
  ): Promise<void> {
    await this.recommendationRepo.update(targetUserId, recommendedUserId, {
      discarded: {
        date: new Date().toISOString(),
      },
    });
  }
}
