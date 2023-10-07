import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import { ProviderEnum } from '../enums/providers.enum';

export interface Token {
  userId: string;
  service: ProviderEnum;
  refreshToken: string;
  scopes: string;
}

export class TokenItem extends Item implements Token {
  userId: string;
  service: ProviderEnum;
  refreshToken: string;
  scopes: string;
}

const TokenSchema = new dynamoose.Schema(
  {
    userId: {
      type: String,
      hashKey: true,
    },
    service: {
      type: String,
      rangeKey: true,
    },
    refreshToken: String,
    scopes: String,
  },
  {
    timestamps: true,
  },
);

export const tokenModelFactory = (tableName: string) => {
  return dynamoose.model<TokenItem>('Token', TokenSchema, {
    tableName,
    create: false,
    waitForActive: false,
  });
};
