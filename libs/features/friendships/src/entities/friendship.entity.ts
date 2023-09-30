import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';

export enum FriendshipStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export interface Friendship {
  proposer: string;
  target: string;
  status: FriendshipStatus;
}

export class FriendshipItem extends Item implements Friendship {
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

export const friendshipModelFactory = (tableName) =>
  dynamoose.model<FriendshipItem>('Friendship', FriendshipSchema, {
    tableName,
    create: false,
    waitForActive: false,
  });
