import { ProviderEnum } from '@Feature/providers';
import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import { ResourceType } from '../enums/resource-type.enum';

export enum InterestRelevance {
  NORMAL = 'normal',
  FAVORITE = 'favorite',
}

export interface Interest {
  userId: string;
  relevance: InterestRelevance;
  provider: ProviderEnum;
  resourceId: string;
  resource: {
    name: string;
    type: ResourceType;
  };
}

export class InterestItem extends Item implements Interest {
  userId: string;
  relevance: InterestRelevance;
  provider: ProviderEnum;
  resourceId: string;
  resource: {
    name: string;
    type: ResourceType;
  };
}

const InterestSchema = new dynamoose.Schema(
  {
    userId: {
      type: String,
      hashKey: true,
    },
    relevance: String,
    provider: String,
    resourceId: {
      type: String,
      rangeKey: true,
    },
    resource: {
      type: Object,
      schema: {
        name: String,
        type: String,
      },
    },
  },
  {
    timestamps: true,
  },
);

export const interestModelFactory = (tableName) =>
  dynamoose.model<InterestItem>('Interest', InterestSchema, {
    tableName,
    create: false,
    waitForActive: false,
  });
