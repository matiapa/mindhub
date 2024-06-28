import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, QueryOptions, Model } from 'mongoose';
import {
  BaseMongooseRepository,
  DeleteResult,
  UpdateResult,
} from '@Provider/mongodb';
import { ProviderConnection } from '../entities/connection.entity';

@Injectable()
export class ProvidersConnRepository extends BaseMongooseRepository<ProviderConnection> {
  constructor(
    @InjectModel(ProviderConnection.name)
    protected model: Model<ProviderConnection>,
  ) {
    super(model);
  }

  public updateOne(
    filter: FilterQuery<ProviderConnection>,
    update: Partial<ProviderConnection>,
    options?: QueryOptions<ProviderConnection>,
  ): Promise<UpdateResult> {
    return super.updateOne(filter, update, options);
  }

  async getOne(
    filter: FilterQuery<ProviderConnection>,
  ): Promise<ProviderConnection | null> {
    return super.getOne(filter);
  }

  async getMany(
    filter: FilterQuery<ProviderConnection>,
  ): Promise<ProviderConnection[]> {
    return super.getMany(filter);
  }

  async deleteOne(
    filter: FilterQuery<ProviderConnection>,
    options?: QueryOptions<ProviderConnection>,
  ): Promise<DeleteResult> {
    return super.deleteOne(filter, options);
  }
}
