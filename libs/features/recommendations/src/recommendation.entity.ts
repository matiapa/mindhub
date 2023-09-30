import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';

export interface Recommendation {
  targetUserId: string;
  recommendedUserId: string;
}

export class RecommendationItem extends Item implements Recommendation {
  targetUserId: string;
  recommendedUserId: string;
}

const RecommendationSchema = new dynamoose.Schema(
  {
    targetUserId: {
      type: String,
      hashKey: true,
    },
    recommendedUserId: {
      type: String,
      hashKey: true,
    },
  },
  {
    timestamps: true,
  },
);

export const recommendationModelFactory = (tableName) =>
  dynamoose.model<RecommendationItem>('Recommendation', RecommendationSchema, {
    tableName,
    create: false,
    waitForActive: false,
  });
