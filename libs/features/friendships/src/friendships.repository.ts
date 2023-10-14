import { Injectable } from '@nestjs/common';
import { Friendship } from './entities';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateQuery, FilterQuery, Model } from 'mongoose';
import {
  BaseMongooseRepository,
  DeleteResult,
  UpdateResult,
} from '@Provider/mongodb';
import { NestedKeyOf } from 'libs/utils/types/nested.type';

@Injectable()
export class FriendshipsRepository extends BaseMongooseRepository<Friendship> {
  constructor(
    @InjectModel(Friendship.name) protected model: Model<Friendship>,
  ) {
    super(model);
  }

  public create(friendship: Friendship): Promise<void> {
    return super.createOne(friendship);
  }

  public updateOne(
    filter: FilterQuery<Friendship>,
    update: UpdateQuery<Friendship>,
  ): Promise<UpdateResult> {
    return super.updateOne(filter, update);
  }

  public async getOne(filter: FilterQuery<Friendship>): Promise<Friendship> {
    return super.getOne(filter);
  }

  public async getMany(
    filter: FilterQuery<Friendship>,
    populate?: NestedKeyOf<Friendship>[],
  ): Promise<Friendship[]> {
    return super.getMany(filter, populate);
  }

  public async remove(filter: FilterQuery<Friendship>): Promise<DeleteResult> {
    return super.deleteMany(filter);
  }
}
