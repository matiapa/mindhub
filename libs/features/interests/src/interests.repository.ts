import { Injectable } from '@nestjs/common';
import { Interest, InterestModel } from './interest.entity';

const MAX_ITEMS = 25;

@Injectable()
export class InterestsRepository {
  async createMany(interests: Partial<Interest>[]): Promise<void> {
    for (let i = 0; i < interests.length; i += MAX_ITEMS) {
      const len = Math.min(i + MAX_ITEMS, interests.length);
      const slice = interests.slice(i, len);
      await InterestModel.batchPut(slice);
    }
  }

  async getByUser(userId: string): Promise<Interest[]> {
    const res = await InterestModel.query({ userId }).exec();
    return [...res.values()];
  }

  remove(userId: string, resourceId: string): Promise<void> {
    return InterestModel.delete({ userId, resourceId });
  }
}
