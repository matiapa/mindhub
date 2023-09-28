import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import { ProviderEnum } from '../enums/providers.enum';

export class Token extends Item {
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

export const TokenModel = dynamoose.model<Token>('Token', TokenSchema, {
  tableName: process.env.DYNAMO_PROVIDER_TOKENS_TABLE,
  create: false,
  waitForActive: false,
});
