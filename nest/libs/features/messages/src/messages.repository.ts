import { Injectable } from '@nestjs/common';
import { Message } from './entities';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, QueryOptions, Model, ProjectionFields } from 'mongoose';
import { BaseMongooseRepository } from '@Provider/mongodb';
import { NestedKeyOf } from 'libs/utils/types/nested.type';

@Injectable()
export class MessagesRepository extends BaseMongooseRepository<Message> {
  constructor(@InjectModel(Message.name) protected model: Model<Message>) {
    super(model);
  }

  public create(message: Message): Promise<void> {
    return super.createOne(message);
  }

  public async getMany(
    filter: FilterQuery<Message>,
    populate?: NestedKeyOf<Message>[],
    projection?: ProjectionFields<Message>,
    options?: QueryOptions<Message>,
  ): Promise<Message[]> {
    return super.getMany(filter, populate, projection, options);
  }
}
