import { ResourceTypeEnum } from '../enums';
import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import { Artist } from './artist.entity';
import { Track } from './track.entity';
import { ProviderEnum } from '@Feature/providers';

export class Resource extends Item {
  resourceId: string;
  provider: ProviderEnum;
  type: ResourceTypeEnum;
  data: Track | Artist;
}

const ResourceSchema = new dynamoose.Schema(
  {
    resourceId: {
      type: String,
      hashKey: true,
    },
    provider: {
      type: String,
      rangeKey: true,
    },
    data: {
      type: Object,
    },
  },
  {
    timestamps: true,
    saveUnknown: ['data.*'],
  },
);

export const ResourceModel = dynamoose.model<Resource>(
  'Resource',
  ResourceSchema,
  {
    tableName: process.env.DYNAMO_RESOURCES_TABLE,
    create: false,
    waitForActive: false,
  },
);
