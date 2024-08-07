import { Injectable } from '@nestjs/common';
import { Recommendation } from './entities/recommendation.entity';
import {
  BaseMongooseRepository,
  IPaginatedParams,
  UpdateResult,
} from '@Provider/mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, UpdateQuery, QueryOptions, Model } from 'mongoose';

@Injectable()
export class RecommendationRepository extends BaseMongooseRepository<Recommendation> {
  constructor(
    @InjectModel(Recommendation.name) protected model: Model<Recommendation>,
  ) {
    super(model);
  }

  public async createMany(recommendations: Recommendation[]): Promise<void> {
    await super.createMany(recommendations);
  }

  public count(filter?: FilterQuery<Recommendation>): Promise<number> {
    return super.count(filter);
  }

  public getMany(
    filter?: FilterQuery<Recommendation>,
    options?: QueryOptions<Recommendation>,
  ): Promise<Recommendation[]> {
    return super.getMany(filter, null, null, options);
  }

  public getPaginated(
    paginated: IPaginatedParams<Recommendation>,
    filter?: FilterQuery<Recommendation>,
  ): Promise<Recommendation[]> {
    return super.getPaginated(paginated, filter);
  }

  public getOne(filter: FilterQuery<Recommendation>): Promise<Recommendation> {
    return super.getOne(filter);
  }

  public async updateOne(
    filter: FilterQuery<Recommendation>,
    update: UpdateQuery<Recommendation>,
  ): Promise<UpdateResult> {
    return super.updateOne(filter, update);
  }
}
