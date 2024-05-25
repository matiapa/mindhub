import { Module } from '@nestjs/common';
import { RatesService } from './rates.service';
import { RatesRepository } from './rates.repository';
import { Rate, RateSchema } from './entities';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Rate.name, schema: RateSchema }]),
  ],
  providers: [RatesService, RatesRepository],
  exports: [RatesService],
})
export class RatesModule {}
