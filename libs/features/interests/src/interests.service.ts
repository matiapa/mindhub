import { Injectable } from '@nestjs/common';
import { Interest } from './entities/interest.entity';
import { InterestsRepository } from './interests.repository';
import {
  GetSharedInterestsResDto,
  SharedInterestDto,
} from './dtos/shared-interests.dto';
import { GetInterestsResDto } from './dtos/interest.dto';

@Injectable()
export class InterestsService {
  constructor(private readonly interestsRepo: InterestsRepository) {}

  async create(interest: Interest): Promise<void> {
    return this.interestsRepo.create(interest);
  }

  async createMany(interests: Interest[]): Promise<void> {
    return this.interestsRepo.createMany(interests);
  }

  async getUserInterests(userId: string): Promise<GetInterestsResDto> {
    return {
      interests: await this.interestsRepo.getByUser(userId),
    };
  }

  async getSharedInterests(
    userA: string,
    userB: string,
  ): Promise<GetSharedInterestsResDto> {
    const interestsUserA = await this.interestsRepo.getByUser(userA);
    const interestsUserB = await this.interestsRepo.getByUser(userB);

    const sharedInterests: SharedInterestDto[] = [];
    for (const interestOfA of interestsUserA) {
      const interestOfB = interestsUserB.find(
        (i) => i.resourceId === interestOfA.resourceId,
      );
      if (interestOfB) {
        sharedInterests.push({
          relevanceForUserA: interestOfA.relevance,
          relevanceForUserB: interestOfB.relevance,
          resource: interestOfA.resource,
        });
      }
    }

    return { sharedInterests };
  }

  async remove(userId: string, resourceId: string): Promise<void> {
    return this.interestsRepo.remove(userId, resourceId);
  }
}
