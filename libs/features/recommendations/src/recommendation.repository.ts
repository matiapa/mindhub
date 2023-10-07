import { Injectable } from '@nestjs/common';
import { ModelType } from 'dynamoose/dist/General';
import { ConfigService } from '@nestjs/config';
import {
  Recommendation,
  RecommendationItem,
  recommendationModelFactory,
} from './recommendation.entity';
import { RecommendationsConfig } from './recommendations.config';

const MAX_PUT_ITEMS = 25;

@Injectable()
export class RecommendationRepository {
  private model: ModelType<RecommendationItem>;

  constructor(configService: ConfigService) {
    const config = configService.get<RecommendationsConfig>('recommendations')!;
    this.model = recommendationModelFactory(config.recommendationsTableName);
  }

  async createMany(recommendations: Recommendation[]): Promise<void> {
    for (let i = 0; i < recommendations.length; i += MAX_PUT_ITEMS) {
      const len = Math.min(i + MAX_PUT_ITEMS, recommendations.length);
      const slice = recommendations.slice(i, len);
      await this.model.batchPut(slice);
    }
  }

  async getByTargetUser(targetUserId: string): Promise<Recommendation[]> {
    const res = await this.model.query({ targetUserId }).exec();
    return [...res.values()];
  }

  async update(
    targetUserId: string,
    recommendedUserId: string,
    update: Partial<Recommendation>,
  ): Promise<void> {
    await this.model.update({ targetUserId, recommendedUserId }, update);
  }
}
