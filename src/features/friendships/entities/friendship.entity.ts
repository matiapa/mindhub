import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';

export enum FriendshipStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export class Friendship extends Item {
  proposer: string;
  target: string;
  status: FriendshipStatus;
}

const FriendshipSchema = new dynamoose.Schema(
  {
    proposer: {
      type: String,
      hashKey: true,
    },
    target: {
      type: String,
      rangeKey: true,
    },
    status: String,
  },
  {
    timestamps: true,
  },
);

export const FriendshipModel = dynamoose.model<Friendship>(
  'Friendship',
  FriendshipSchema,
  {
    tableName: process.env.DYNAMO_FRIENDSHIPS_TABLE,
    create: false,
    waitForActive: false,
  },
);
