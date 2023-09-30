import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';

export enum Gender {
  MAN = 'man',
  WOMAN = 'woman',
  OTHER = 'other',
}

export interface User {
  _id: string;

  email: string;

  profile: {
    name: string;
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

export class UserItem extends Item implements User {
  _id: string;

  email: string;

  profile: {
    name: string;
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

const UserSchema = new dynamoose.Schema(
  {
    _id: {
      type: String,
      hashKey: true,
    },
    email: String,
    profile: {
      type: Object,
      schema: {
        name: String,
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
    timestamps: true,
  },
);

export const userModelFactory = (tableName) =>
  dynamoose.model<UserItem>('User', UserSchema, {
    tableName,
    create: false,
    waitForActive: false,
  });
