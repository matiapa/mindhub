import { Injectable } from '@nestjs/common';
import { Interest } from './entities/interest.entity';
import { InterestsRepository } from './interests.repository';
import { GetSharedInterestsResDto } from './dtos/get-shared-interests.dto';
import {
  GetUserInterestsReqDto,
  GetUserInterestsResDto,
} from './dtos/get-user-interests.dto';
import { QueueService } from '@Provider/queue';

@Injectable()
export class InterestsService {
  constructor(
    private readonly interestsRepo: InterestsRepository,
    private readonly queueService: QueueService,
  ) {}

  async upsertMany(interests: Interest[], userId: string): Promise<void> {
    await this.interestsRepo.upsertMany(interests);

    await this.queueService.sendMessage(process.env.PERSONALITY_REQUESTS_QUEUE_URL, { userId })

  }

  async getUserInterests(
    dto: GetUserInterestsReqDto,
    userId: string,
  ): Promise<GetUserInterestsResDto> {
    const interests = await this.interestsRepo.getPaginated(
      {
        offset: dto.offset,
        limit: dto.limit,
        sortBy: 'date',
        sortOrder: 'desc',
      },
      { userId },
    );

    return {
      interests: interests.map((i) => ({
        _id: i._id,
        relevance: i.relevance,
        provider: i.provider,
        resource: i.resource,
        date: i.date,
      })),
      count: interests.length,
      total: await this.interestsRepo.count({ userId }),
    };
  }

  async getSharedInterests(
    userIds: string[],
  ): Promise<GetSharedInterestsResDto> {
    return {
      sharedInterests: await this.interestsRepo.getShared(userIds),
    };
  }

  async remove(_id: string, userId: string): Promise<void> {
    await this.interestsRepo.remove({ _id, userId });
  }
}
