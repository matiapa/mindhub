import {
  ResourceTypeEnum,
  ResourceProviderEnum,
} from 'apps/resources/src/features/resources/enums';
import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import { TrackSchema } from './track.entity';
import { ArtistSchema } from './artist.entity';

export class Resource extends Item {
  resourceId: string;
  provider: ResourceProviderEnum;
  type: ResourceTypeEnum;
  data: object;
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
      schema: [TrackSchema, ArtistSchema],
    },
  },
  {
    timestamps: true,
  },
);

export const ResourceModel = dynamoose.model<Resource>(
  'Resource',
  ResourceSchema,
  {
    tableName: process.env.DYNAMO_RESOURCES_TABLE,
    create: true,
    waitForActive: true,
  },
);
