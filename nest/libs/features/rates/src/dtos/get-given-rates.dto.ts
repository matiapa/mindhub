import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';

export enum RateType {
  PROPOSED = 'proposed',
  RECEIVED = 'received',
  ESTABLISHED = 'established',
}

export class GivenRateDto {
  @IsNotEmpty()
  rateeId: string;

  @IsNotEmpty()
  rating: number;
}

export class GetGivenRatesResDto {
  @IsArray()
  @Type(() => GivenRateDto)
  @ValidateNested({ each: true })
  rates: GivenRateDto[];
}
