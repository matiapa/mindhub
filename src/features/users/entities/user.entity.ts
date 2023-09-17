import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';

export enum Gender {
  MAN = 'man',
  WOMAN = 'woman',
  OTHER = 'other',
}

export class User extends Item {
  _id: string;

  profile: {
    gender: Gender;
    birthday: string;
    biography?: string;
  };

  lastConnection?: {
    lat?: number;
    long?: number;
    date: string;
  };
}

export const UserModel = dynamoose.model<User>(
  'User',
  {
    _id: String,
    profile: {
      type: Object,
      schema: {
        gender: String,
        birthday: String,
        biography: String,
      },
    },
    lastConnection: {
      type: Object,
      schema: {
        lat: Number,
        long: Number,
        date: String,
      },
    },
  },
  {
    tableName: process.env.DYNAMO_USERS_TABLE,
  },
);
