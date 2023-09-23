import { Injectable } from '@nestjs/common';
import { Resource, ResourceModel } from './entities/resource.entity';

@Injectable()
export class ResourcesRepository {
  async createMany(resources: Partial<Resource>[]): Promise<void> {
    await ResourceModel.batchPut(resources);
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
