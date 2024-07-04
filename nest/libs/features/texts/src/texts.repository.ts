import { Injectable } from '@nestjs/common';
import { Text } from './entities/text.entity';
import {
  BaseMongooseRepository,
  DeleteResult,
  IPaginatedParams,
} from '@Provider/mongodb';
import { FilterQuery, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TextsConfig } from './texts.config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TextsRepository extends BaseMongooseRepository<Text> {
  private config: TextsConfig;

  constructor(
    @InjectModel(Text.name) protected model: Model<Text>,
    configService: ConfigService,
  ) {
    super(model);
    this.config = configService.get<TextsConfig>('texts');
  }

  public async upsertMany(texts: Text[]): Promise<void> {
    await super.upsertMany(texts);
  }

  public count(filter?: FilterQuery<Text>): Promise<number> {
    return super.count(filter);
  }

  public getPaginated(
    paginated: IPaginatedParams<Omit<Text, '_id'>>,
    filter?: FilterQuery<Text>,
  ): Promise<Text[]> {
    return super.getPaginated(paginated, filter);
  }

  public async deleteMany(filter: FilterQuery<Text>): Promise<DeleteResult> {
    return super.deleteMany(filter);
  }
}
