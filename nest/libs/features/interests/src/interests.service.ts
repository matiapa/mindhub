import { Injectable, Logger } from '@nestjs/common';
import { InterestsRepository } from './interests.repository';
import { GetSharedInterestsResDto } from './dtos/get-shared-interests.dto';
import {
  GetUserInterestsReqDto,
  GetUserInterestsResDto,
} from './dtos/get-user-interests.dto';
import { QueueService } from '@Provider/queue';
import { ProviderEnum } from '@Feature/providers';
import { CreateManualInterestDto, CreateProviderInterestDto } from './dtos';
import { hashObjectId } from 'libs/utils';
import { Interest } from './entities/interest.entity';
import { ObjectId } from 'bson';

@Injectable()
export class InterestsService {
  private readonly logger = new Logger(InterestsService.name);

  constructor(
    private readonly interestsRepo: InterestsRepository,
    private readonly queueService: QueueService,
  ) {}

  async upsertManual(dto: CreateManualInterestDto, userId: string): Promise<Interest> {
    // Hash the resource name to create a unique resourceId
    // so that resources with the same title get matched by their id
    const resourceId = hashObjectId(dto.resource.name).toString();

    // Hash the userId and resourceId to create a unique interestId
    // so that the same interest is not inserted twice in the database
    const interestId = hashObjectId(`${userId}|${resourceId}`)

    const interest = {
      _id: interestId,
      userId,
      relevance: dto.relevance,
      provider: ProviderEnum.USER,
      resource: {
        id: resourceId,
        name: dto.resource.name,
        type: dto.resource.type,
      },
      date: new Date(),
    };

    await this.interestsRepo.upsertMany([interest]);

    // TODO: Enable once APR handles request throttling
    // await this.queueService.sendMessage(
    //   process.env.PERSONALITY_REQUESTS_QUEUE_URL,
    //   { userId },
    // );

    return interest;
  }

  async upsertProvider(interests: CreateProviderInterestDto[], userId: string): Promise<void> {
    const interestsWithIds = interests.map((i) => {
      // Hash the userId and resourceId to create a unique interestId
      // so that the same interest is not inserted twice in the database
      const interestId = hashObjectId(`${userId}|${i.resource.id}`)

      return {
        _id: interestId,
        userId,
        relevance: i.relevance,
        provider: i.provider,
        resource: {
          id: i.resource.id,
          name: i.resource.name,
          type: i.resource.type,
        },
        date: new Date(),
      };
    });

    await this.interestsRepo.upsertMany(interestsWithIds);

    this.logger.log('Inserted interests in bulk', {
      userId,
      amount: interests?.length,
    });

    await this.queueService.sendMessage(
      process.env.PERSONALITY_REQUESTS_QUEUE_URL,
      { userId },
    );
  }

  async getUserInterests(
    dto: GetUserInterestsReqDto,
    userId: string,
  ): Promise<GetUserInterestsResDto> {
    const filters = {
      userId,
      ...(dto.resourceName && {
        'resource.name': { $regex: new RegExp(dto.resourceName, 'i') },
      }),
    };

    const interests = await this.interestsRepo.getPaginated(
      {
        offset: dto.offset,
        limit: dto.limit,
        sortBy: 'date',
        sortOrder: 'desc',
      },
      filters,
    );

    return {
      interests: interests.map((i) => ({
        _id: i['_id'].toString(),
        relevance: i.relevance,
        provider: i.provider,
        resource: i.resource,
        date: i.date,
      })),
      count: interests.length,
      total: await this.interestsRepo.count(filters),
    };
  }

  async getSharedInterests(
    userIds: string[],
  ): Promise<GetSharedInterestsResDto> {
    return {
      sharedInterests: await this.interestsRepo.getShared(userIds),
    };
  }

  async delete(_id: string, userId: string): Promise<void> {
    await this.interestsRepo.deleteMany({ _id: new ObjectId(_id), userId });
  }

  async deleteByProvider(
    provider: ProviderEnum,
    userId: string,
  ): Promise<void> {
    await this.interestsRepo.deleteMany({ provider, userId });
  }
}
