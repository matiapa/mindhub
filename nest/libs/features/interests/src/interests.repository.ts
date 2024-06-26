import { Injectable } from '@nestjs/common';
import {
  BaseMongooseRepository,
  DeleteResult,
  IPaginatedParams,
} from '@Provider/mongodb';
import { Interest } from './entities/interest.entity';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
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
    /** This ID override is needed so that the same interest is
     * not inserted twice in the database, note that the ID has
     * coded both the userId and the resourceId.
     */
    const interestsWithIds = interests.map((i) => {
      const _id = this.hashObjectId(`${i.userId}|${i.resource.id}`);
      return _.assign(i, { _id });
    });
    await super.upsertMany(interestsWithIds);
  }

  public count(filter?: FilterQuery<Interest>): Promise<number> {
    return super.count(filter);
  }

  public getPaginated(
    paginated: IPaginatedParams<Interest>,
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

  public async remove(filter: FilterQuery<Interest>): Promise<DeleteResult> {
    return super.deleteMany(filter);
  }
}
