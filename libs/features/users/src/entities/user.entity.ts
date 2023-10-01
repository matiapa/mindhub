import { ResourceType } from '@Feature/resources/enums';
import { ResourceTypeRelevance } from '@Feature/resources/enums/resource-type-relevance.enum';
import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';

export enum Gender {
  MAN = 'man',
  WOMAN = 'woman',
  OTHER = 'other',
}

export interface UserFilters {
  minBirthday: number;
  maxBirthday: number;
  minLastConnectionDate: number;
  gender: Gender;
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

  preferences?: {
    filters?: UserFilters;
    typeRelevances?: Map<ResourceType, ResourceTypeRelevance>;
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

  preferences?: {
    filters?: UserFilters;
    typeRelevances?: Map<ResourceType, ResourceTypeRelevance>;
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
    preferences: {
      type: Object,
      schema: {
        filters: Object,
        typeRelevances: Object,
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
