import { Injectable } from '@nestjs/common';
import { Resource, ResourceModel } from './entities/resource.entity';

const MAX_ITEMS = 25;

@Injectable()
export class ResourcesRepository {
  async createMany(resources: Partial<Resource>[]): Promise<void> {
    for (let i = 0; i < resources.length; i += MAX_ITEMS) {
      const len = Math.min(i + MAX_ITEMS, resources.length);
      const slice = resources.slice(i, len);
      await ResourceModel.batchPut(slice);
    }
  }

  async getById(resourceId: string): Promise<Resource> {
    return ResourceModel.get({ resourceId });
  }

  async getByIds(resourceIds: string[]): Promise<Resource[]> {
    const res = await ResourceModel.batchGet(resourceIds);
    return [...res.values()];
  }

  remove(userId: string, resourceId: string): Promise<void> {
    return ResourceModel.delete({ userId, resourceId });
  }
}
