import { Injectable } from '@nestjs/common';
import { Interest, InterestModel } from './interest.entity';

@Injectable()
export class InterestsRepository {
  async createMany(interests: Partial<Interest>[]): Promise<void> {
    await InterestModel.batchPut(interests);
  }

  async getByUser(userId: string): Promise<Interest[]> {
    const res = await InterestModel.query({ userId }).exec();
    return [...res.values()];
  }

  remove(userId: string, resourceId: string): Promise<void> {
    return InterestModel.delete({ userId, resourceId });
  }
}
