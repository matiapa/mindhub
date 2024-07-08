import { Injectable } from '@nestjs/common';
import {
  BaseMongooseRepository,
  DeleteResult,
} from '@Provider/mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, QueryOptions } from 'mongoose';
import { NotificationSubscription } from '../entities/notification-subscription.entity';

@Injectable()
export class NotificationSubscriptionsRepository extends BaseMongooseRepository<NotificationSubscription> {

  constructor(
    @InjectModel(NotificationSubscription.name) protected model: Model<NotificationSubscription>,
  ) {
    super(model);
  }

  public async upsertMany(subscriptions: NotificationSubscription[]): Promise<void> {
    await super.upsertMany(subscriptions);
  }

  public async getMany(filter: FilterQuery<NotificationSubscription>): Promise<NotificationSubscription[]> {
    return await super.getMany(filter);
  }

  public async deleteOne(filter: FilterQuery<NotificationSubscription>, options?: QueryOptions<NotificationSubscription>): Promise<DeleteResult> {
    return await super.deleteOne(filter, options);
  }
}
