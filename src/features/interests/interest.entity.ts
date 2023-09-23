import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';

export class Interest extends Item {
  userId: string;
  resourceId: string;
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
  },
  {
    timestamps: true,
  },
);

export const InterestModel = dynamoose.model<Interest>(
  'Interest',
  InterestSchema,
  {
    tableName: process.env.DYNAMO_INTERESTS_TABLE,
    create: false,
    waitForActive: false,
  },
);
