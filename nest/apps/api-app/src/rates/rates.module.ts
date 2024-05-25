import { Module } from '@nestjs/common';
import { RatesModule } from '@Feature/rates';
import { RatesController } from './rates.controller';

@Module({
  imports: [RatesModule],
  controllers: [RatesController],
})
export class ApiRatesModule {}
