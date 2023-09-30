import { Injectable } from '@nestjs/common';
import {
  Resource,
  ResourceItem,
  resourceModelFactory,
} from './entities/resource.entity';
import { ModelType } from 'dynamoose/dist/General';
import { ConfigService } from '@nestjs/config';
import { ResourcesConfig } from './resources.config';

const MAX_PUT_ITEMS = 25;
const MAX_READ_ITEMS = 100;

@Injectable()
export class ResourcesRepository {
  private model: ModelType<ResourceItem>;

  constructor(configService: ConfigService) {
    const config = configService.get<ResourcesConfig>('resources')!;
    this.model = resourceModelFactory(config.resourcesTableName);
  }

  async createMany(resources: Resource[]): Promise<void> {
    for (let i = 0; i < resources.length; i += MAX_PUT_ITEMS) {
      const len = Math.min(i + MAX_PUT_ITEMS, resources.length);
      const slice = resources.slice(i, len);
      await this.model.batchPut(slice);
    }
  }

  async getById(resourceId: string): Promise<Resource> {
    return this.model.get({ resourceId });
  }

  async getByIds(resourceIds: string[]): Promise<Resource[]> {
    const resources: Resource[] = [];

    for (let i = 0; i < resourceIds.length; i += MAX_READ_ITEMS) {
      const len = Math.min(i + MAX_READ_ITEMS, resourceIds.length);
      const slice = resourceIds.slice(i, len);
      const res = await this.model.batchGet(slice);
      resources.push(...res.values());
    }

    return resources;
  }

  remove(userId: string, resourceId: string): Promise<void> {
    return this.model.delete({ userId, resourceId });
  }
}
