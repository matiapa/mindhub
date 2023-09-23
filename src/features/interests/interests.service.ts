import { Injectable } from '@nestjs/common';
import { Interest } from './interest.entity';
import { InterestsRepository } from './interests.repository';
import { ResourcesRepository } from '../resources/resources.repository';

@Injectable()
export class InterestsService {
  constructor(
    private readonly interestsRepo: InterestsRepository,
    private readonly resourcesRepo: ResourcesRepository,
  ) {}

  async createMany(interests: Partial<Interest>[]): Promise<void> {
    return this.interestsRepo.createMany(interests);
  }

  async getByUser(userId: string): Promise<Interest[]> {
    return this.interestsRepo.getByUser(userId);
  }

  async remove(userId: string, resourceId: string): Promise<void> {
    return this.interestsRepo.remove(userId, resourceId);
  }
}
