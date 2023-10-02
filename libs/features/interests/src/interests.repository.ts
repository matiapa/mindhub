import { Injectable } from '@nestjs/common';
import {
  Interest,
  InterestItem,
  interestModelFactory,
} from './entities/interest.entity';
import { ModelType } from 'dynamoose/dist/General';
import { InterestsConfig } from './interests.config';
import { ConfigService } from '@nestjs/config';

const MAX_PUT_ITEMS = 25;

@Injectable()
export class InterestsRepository {
  private model: ModelType<InterestItem>;

  constructor(configService: ConfigService) {
    const config = configService.get<InterestsConfig>('interests')!;
    this.model = interestModelFactory(config.interestsTableName);
  }

  async create(interest: Interest): Promise<void> {
    await this.model.update(interest);
  }

  async createMany(interests: Interest[]): Promise<void> {
    for (let i = 0; i < interests.length; i += MAX_PUT_ITEMS) {
      const len = Math.min(i + MAX_PUT_ITEMS, interests.length);
      const slice = interests.slice(i, len);
      await this.model.batchPut(slice);
    }
  }

  async getByUser(userId: string): Promise<Interest[]> {
    const res = await this.model.query({ userId }).exec();
    return [...res.values()];
  }

  remove(userId: string, resourceId: string): Promise<void> {
    return this.model.delete({ userId, resourceId });
  }
}
