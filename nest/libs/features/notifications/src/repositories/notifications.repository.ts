import { Injectable } from '@nestjs/common';
import { Notification } from '../entities/notification.entity';
import {
  BaseMongooseRepository,
  DeleteResult,
  UpdateResult,
} from '@Provider/mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, UpdateQuery, QueryOptions, Model } from 'mongoose';

@Injectable()
export class NotificationsRepository extends BaseMongooseRepository<Notification> {
  constructor(
    @InjectModel(Notification.name) protected model: Model<Notification>,
  ) {
    super(model);
  }

  public async createOneAndGetId(notification: Notification): Promise<string> {
    return super.createOneAndGetId(notification);
  }

  public updateMany(
    filter: FilterQuery<Notification>,
    update: UpdateQuery<Notification>,
    options?: QueryOptions<Notification>,
  ): Promise<UpdateResult> {
    return this.model.updateMany(filter, update, options).lean();
  }

  public count(filter?: FilterQuery<Notification>): Promise<number> {
    return super.count(filter);
  }

  public getMany(
    filter?: FilterQuery<Notification>,
    options?: QueryOptions<Notification>,
  ): Promise<Notification[]> {
    return super.getMany(filter, null, null, options);
  }

  public async deleteMany(
    filter: FilterQuery<Notification>,
  ): Promise<DeleteResult> {
    return super.deleteMany(filter);
  }
}
