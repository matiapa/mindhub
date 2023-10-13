import { ResourceType } from '@Feature/interests/enums/resource-type.enum';
import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';

export interface InterestScores {
  global: number;
  [ResourceType.ARTIST]: number;
  [ResourceType.TRACK]: number;
}

export interface Recommendation {
  targetUserId: string;
  recommendedUserId: string;
  scores: {
    global: number;
    interests: InterestScores;
  };
  reviewed?: {
    accepted: boolean;
    date: string;
  };
}

export class RecommendationItem extends Item implements Recommendation {
  targetUserId: string;
  recommendedUserId: string;
  scores: {
    global: number;
    interests: {
      global: number;
      [ResourceType.ARTIST]: number;
      [ResourceType.TRACK]: number;
    };
  };
  reviewed?: {
    accepted: boolean;
    date: string;
  };
}

const RecommendationSchema = new dynamoose.Schema(
  {
    targetUserId: {
      type: String,
      hashKey: true,
    },
    recommendedUserId: {
      type: String,
      rangeKey: true,
    },
    scores: {
      type: Object,
      schema: {
        global: Number,
        interests: {
          type: Object,
          schema: {
            [ResourceType.ARTIST]: Number,
            [ResourceType.TRACK]: Number,
          },
        },
      },
    },
    reviewed: {
      type: Object,
      schema: {
        accepted: Boolean,
        date: String,
      },
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
