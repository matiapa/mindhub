import { Injectable, NotFoundException } from '@nestjs/common';
import { PersonalitiesRepository } from './personality.repository';
import { GetUserPersonalityDto } from './dtos/get-user-personality.dto';

@Injectable()
export class PersonalitiesService {
  constructor(private readonly personalitiesRepo: PersonalitiesRepository) {}

  async getUserPersonality(userId: string): Promise<GetUserPersonalityDto> {
    const personality = await this.personalitiesRepo.getOne({ userId });
    if (!personality) {
      throw new NotFoundException('Personality not found');
    }

    return {
      o: personality.o,
      c: personality.c,
      e: personality.e,
      a: personality.a,
      n: personality.n,
    };
  }
}
