import { BadRequestException, Injectable } from '@nestjs/common';
import { RatesRepository } from './rates.repository';
import { GetGivenRatesResDto } from './dtos/get-given-rates.dto';

@Injectable()
export class RatesService {
  constructor(private readonly ratesRepo: RatesRepository) {}

  async rateUser(
    raterId: string,
    rateeId: string,
    rating: number,
  ): Promise<void> {
    // Check that ratee is not the same as rater

    if (raterId === rateeId)
      throw new BadRequestException('Rater cannot be the same as ratee');

    // Check that rating is between 1 and 5

    if (rating < 1 || rating > 5)
      throw new BadRequestException('Rating must be between 1 and 5');

    // If rate exists, update it

    const existingRate = await this.ratesRepo.getOne({
      rater: raterId,
      ratee: rateeId,
    });
    if (existingRate) {
      await this.ratesRepo.updateOne(
        {
          rater: raterId,
          ratee: rateeId,
        },
        {
          $set: { rating },
        },
      );
    } else {
      // Otherwise, create the rate

      await this.ratesRepo.create({
        rater: raterId,
        ratee: rateeId,
        rating,
      });
    }
  }

  async getGivenRates(
    raterId: string,
    rateeIds?: string[],
  ): Promise<GetGivenRatesResDto> {
    const res = await this.ratesRepo.getMany({
      rater: raterId,
      ...(rateeIds && { ratee: { $in: rateeIds } }),
    });

    return {
      rates: res.map((r) => ({
        rateeId: r.ratee,
        rating: r.rating,
      })),
    };
  }

  async getRate(raterId: string, rateeId: string): Promise<number | null> {
    const res = await this.ratesRepo.getOne({ rater: raterId, ratee: rateeId });
    return res?.rating;
  }
}
