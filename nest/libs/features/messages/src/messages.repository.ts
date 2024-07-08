import { Injectable } from '@nestjs/common';
import { Message } from './entities';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, QueryOptions, Model, UpdateQuery } from 'mongoose';
import { BaseMongooseRepository, UpdateResult } from '@Provider/mongodb';

@Injectable()
export class MessagesRepository extends BaseMongooseRepository<Message> {
  constructor(@InjectModel(Message.name) protected model: Model<Message>) {
    super(model);
  }

  public create(message: Message): Promise<string> {
    return super.createOneAndGetId(message);
  }

  public updateMany(
    filter: FilterQuery<Message>,
    update: UpdateQuery<Message>,
  ): Promise<UpdateResult> {
    return super.updateMany(filter, update);
  }

  public async getMany(
    filter: FilterQuery<Message>,
    options?: QueryOptions<Message>,
  ): Promise<Message[]> {
    return super.getMany(filter, null, null, options);
  }
}
