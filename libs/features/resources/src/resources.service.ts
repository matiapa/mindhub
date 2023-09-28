import { Injectable } from '@nestjs/common';
import { Resource } from './entities/resource.entity';
import { ResourcesRepository } from './resources.repository';

@Injectable()
export class ResourcesService {
  constructor(private readonly resourcesRepo: ResourcesRepository) {}

  async createMany(resources: Partial<Resource>[]): Promise<void> {
    return this.resourcesRepo.createMany(resources);
  }

  async getById(resourceId: string): Promise<Resource> {
    return this.resourcesRepo.getById(resourceId);
  }

  async getByIds(resourceIds: string[]): Promise<Resource[]> {
    return this.resourcesRepo.getByIds(resourceIds);
  }
}
