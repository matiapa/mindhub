import { Injectable } from '@nestjs/common';
import { Text } from './entities/text.entity';
import {
  BaseMongooseRepository,
  DeleteResult,
  IPaginatedParams,
} from '@Provider/mongodb';
import { FilterQuery, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import _ from 'lodash';
import { v5 as uuidv5 } from 'uuid';
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
    const textsWithIds = texts.map((t) => {
      const _id = uuidv5(`${t.userId}|${t.rawText}`, this.config.uuidNamespace);
      return _.assign(t, { _id });
    });
    await super.upsertMany(textsWithIds);
  }

  public count(filter?: FilterQuery<Text>): Promise<number> {
    return super.count(filter);
  }

  public getPaginated(
    paginated: IPaginatedParams<Text>,
    filter?: FilterQuery<Text>,
  ): Promise<Text[]> {
    return super.getPaginated(paginated, filter);
  }

  public async remove(filter: FilterQuery<Text>): Promise<DeleteResult> {
    return super.deleteMany(filter);
  }
}
