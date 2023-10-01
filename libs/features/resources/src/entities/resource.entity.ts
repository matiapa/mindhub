import { ResourceType } from '../enums';
import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import { Artist } from './artist.entity';
import { Track } from './track.entity';
import { ProviderEnum } from '@Feature/providers';

export interface Resource {
  resourceId: string;
  provider: ProviderEnum;
  type: ResourceType;
  data: Track | Artist;
}

export class ResourceItem extends Item implements Resource {
  resourceId: string;
  provider: ProviderEnum;
  type: ResourceType;
  data: Track | Artist;
}

const ResourceSchema = new dynamoose.Schema(
  {
    resourceId: {
      type: String,
      hashKey: true,
    },
    provider: String,
    type: String,
    data: Object,
  },
  {
    timestamps: true,
    saveUnknown: ['data.*'],
  },
);

export const resourceModelFactory = (tableName) =>
  dynamoose.model<ResourceItem>('Resource', ResourceSchema, {
    tableName,
    create: false,
    waitForActive: false,
  });
