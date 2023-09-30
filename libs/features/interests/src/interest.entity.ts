import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';

export interface Interest {
  userId: string;
  resourceId: string;
  relevance?: number;
}

export class InterestItem extends Item implements Interest {
  userId: string;
  resourceId: string;
  relevance?: number;
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
    relevance: Number,
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
