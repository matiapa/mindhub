import { Injectable } from '@nestjs/common';
import { Rate } from './entities';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateQuery, FilterQuery, Model } from 'mongoose';
import { BaseMongooseRepository, UpdateResult } from '@Provider/mongodb';
import { NestedKeyOf } from 'libs/utils/types/nested.type';

@Injectable()
export class RatesRepository extends BaseMongooseRepository<Rate> {
  constructor(@InjectModel(Rate.name) protected model: Model<Rate>) {
    super(model);
  }

  public create(rate: Rate): Promise<void> {
    return super.createOne(rate);
  }

  public updateOne(
    filter: FilterQuery<Rate>,
    update: UpdateQuery<Rate>,
  ): Promise<UpdateResult> {
    return super.updateOne(filter, update);
  }

  public async getOne(filter: FilterQuery<Rate>): Promise<Rate | null> {
    return super.getOne(filter);
  }

  public async getMany(
    filter: FilterQuery<Rate>,
    populate?: NestedKeyOf<Rate>[],
  ): Promise<Rate[]> {
    return super.getMany(filter, populate);
  }
}
