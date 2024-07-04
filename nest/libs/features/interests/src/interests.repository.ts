import { Injectable } from '@nestjs/common';
import {
  BaseMongooseRepository,
  DeleteResult,
  IPaginatedParams,
} from '@Provider/mongodb';
import { Interest } from './entities/interest.entity';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, InsertManyOptions, Model } from 'mongoose';
import { SharedInterestDto } from './dtos';
import _ from 'lodash';
import { ConfigService } from '@nestjs/config';
import { InterestsConfig } from './interests.config';

@Injectable()
export class InterestsRepository extends BaseMongooseRepository<Interest> {
  private config: InterestsConfig;

  constructor(
    @InjectModel(Interest.name) protected model: Model<Interest>,
    configService: ConfigService,
  ) {
    super(model);
    this.config = configService.get<InterestsConfig>('interests');
  }

  public async upsertMany(interests: Interest[]): Promise<void> {
    await super.upsertMany(interests);
  }

  public count(filter?: FilterQuery<Interest>): Promise<number> {
    return super.count(filter);
  }

  public getPaginated(
    paginated: IPaginatedParams<Omit<Interest, "_id">>,
    filter?: FilterQuery<Interest>,
  ): Promise<Interest[]> {
    return super.getPaginated(paginated, filter);
  }

  public async getShared(userIds: string[]): Promise<SharedInterestDto[]> {
    const res = await this.model.aggregate([
      {
        $match: { userId: { $in: userIds } },
      },
      {
        $group: {
          _id: '$resource.id',
          resource: { $first: '$resource' },
          relevances: { $push: { userId: '$userId', relevance: '$relevance' } },
          count: { $count: {} },
        },
      },
      {
        $match: { count: { $gte: 2 } },
      },
    ]);

    return res.map((e) => ({
      resource: e.resource,
      relevances: e.relevances,
    }));
  }

  public async deleteMany(
    filter: FilterQuery<Interest>,
  ): Promise<DeleteResult> {
    return super.deleteMany(filter);
  }
}
