import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import { ResourceProviderEnum } from '../resources/enums';

export class Token extends Item {
  userId: string;
  service: ResourceProviderEnum;
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
  tableName: process.env.DYNAMO_RESOURCE_SERVERS_AUTH_TABLE,
  create: false,
  waitForActive: false,
});
