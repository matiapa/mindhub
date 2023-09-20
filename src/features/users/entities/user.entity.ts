import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';

export enum Gender {
  MAN = 'man',
  WOMAN = 'woman',
  OTHER = 'other',
}

export class User extends Item {
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

export const UserModel = dynamoose.model<User>('User', UserSchema, {
  tableName: process.env.DYNAMO_USERS_TABLE,
  create: false,
  waitForActive: false,
});
