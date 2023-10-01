import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';

export enum InterestRelevance {
  NORMAL = 'normal',
  FAVORITE = 'favorite',
}

export interface Interest {
  userId: string;
  resourceId: string;
  relevance: InterestRelevance;
}

export class InterestItem extends Item implements Interest {
  userId: string;
  resourceId: string;
  relevance: InterestRelevance;
}

const InterestSchema = new dynamoose.Schema(
  {
    userId: {
      type: String,
      hashKey: true,
    },
    resourceId: {
      type: String,
      rangeKey: true,
    },
    relevance: String,
  },
  {
    timestamps: true,
  },
);

export const interestModelFactory = (tableName) =>
  dynamoose.model<InterestItem>('Interest', InterestSchema, {
    tableName,
    create: false,
    waitForActive: false,
  });
