import { Recommendation } from '../recommendation.entity';

export interface RecommendationAlgorithm {
  calculateRecommendations(userId: string): Promise<Recommendation[]>;
}
