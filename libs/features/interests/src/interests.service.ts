import { BadRequestException, Injectable } from '@nestjs/common';
import { Interest } from './interest.entity';
import { InterestsRepository } from './interests.repository';
import { ResourcesService } from '@Feature/resources';
import { GetUserInterestsResDto } from './dtos/get-user-interests.dto';
import {
  GetSharedInterestsResDto,
  SharedInterestDto,
} from './dtos/get-shared-interests.dto';

@Injectable()
export class InterestsService {
  constructor(
    private readonly interestsRepo: InterestsRepository,
    private readonly resourcesService: ResourcesService,
  ) {}

  async create(interest: Interest): Promise<void> {
    const resource = await this.resourcesService.getById(interest.resourceId!);
    if (!resource) {
      throw new BadRequestException('The given resource id does not exist');
    }
    return this.interestsRepo.create(interest);
  }

  async createMany(interests: Interest[]): Promise<void> {
    return this.interestsRepo.createMany(interests);
  }

  async getUserInterests(
    userId: string,
    includeResourceData: boolean,
  ): Promise<GetUserInterestsResDto> {
    const interests = await this.interestsRepo.getByUser(userId);

    let resources;
    if (includeResourceData) {
      resources = await this.resourcesService.getByIds(
        interests.map((i) => i.resourceId),
      );
    }

    return {
      interests,
      resources,
    };
  }

  async getSharedInterests(
    userA: string,
    userB: string,
  ): Promise<GetSharedInterestsResDto> {
    const interestsUserA = await this.interestsRepo.getByUser(userA);
    const interestsUserB = await this.interestsRepo.getByUser(userB);

    const resourceIdsUserA = interestsUserA.map((i) => i.resourceId);
    const resourceIdsUserB = interestsUserB.map((i) => i.resourceId);

    const sharedResourceIds: string[] = [];
    for (const ownResourceId of resourceIdsUserA) {
      if (resourceIdsUserB.includes(ownResourceId)) {
        sharedResourceIds.push(ownResourceId);
      }
    }

    const resources = await this.resourcesService.getByIds(sharedResourceIds);

    const sharedInterests: SharedInterestDto[] = [];
    for (const sharedResourceId of sharedResourceIds) {
      sharedInterests.push({
        relevanceForUserA: interestsUserA.find(
          (i) => i.resourceId == sharedResourceId,
        )!.relevance,
        relevanceForUserB: interestsUserB.find(
          (i) => i.resourceId == sharedResourceId,
        )!.relevance,
        resource: resources.find((r) => r.resourceId == sharedResourceId)!,
      });
    }

    return { sharedInterests };
  }

  async remove(userId: string, resourceId: string): Promise<void> {
    return this.interestsRepo.remove(userId, resourceId);
  }
}
