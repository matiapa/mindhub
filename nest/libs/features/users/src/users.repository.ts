import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, QueryOptions, Model } from 'mongoose';
import { User } from './entities';
import { BaseMongooseRepository, UpdateResult } from '@Provider/mongodb';

@Injectable()
export class UsersRepository extends BaseMongooseRepository<User> {
  constructor(@InjectModel(User.name) protected model: Model<User>) {
    super(model);
  }

  public async createOne(entity: User): Promise<void> {
    await this.createMany([entity]);
  }

  public updateOne(
    filter: FilterQuery<User>,
    update: Partial<User>,
    options?: QueryOptions<User>,
  ): Promise<UpdateResult> {
    return super.updateOne(filter, update, options);
  }

  async getOne(filter: FilterQuery<User>): Promise<User> {
    return super.getOne(filter);
  }

  async getMany(filter: FilterQuery<User>): Promise<User[]> {
    return super.getMany(filter);
  }
}
