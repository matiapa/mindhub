import { Injectable } from '@nestjs/common';
import { Personality } from './entities/personality.entity';
import { BaseMongooseRepository } from '@Provider/mongodb';
import { FilterQuery, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PersonalityConfig } from './personality.config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PersonalitiesRepository extends BaseMongooseRepository<Personality> {
  private config: PersonalityConfig;

  constructor(
    @InjectModel(Personality.name) protected model: Model<Personality>,
    configService: ConfigService,
  ) {
    super(model);
    this.config = configService.get<PersonalityConfig>('personalities');
  }

  public getOne(filter: FilterQuery<Personality>): Promise<Personality | null> {
    return super.getOne(filter);
  }

  public getMany(filter: FilterQuery<Personality>): Promise<Personality[]> {
    return super.getMany(filter);
  }
}
