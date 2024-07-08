import { Injectable } from '@nestjs/common';
import {
  BaseMongooseRepository,
} from '@Provider/mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
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
}
