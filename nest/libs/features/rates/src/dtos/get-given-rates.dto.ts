import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GivenRateDto {
  @IsString()
  @IsNotEmpty()
  rateeId: string;

  @IsNumber()
  @IsNotEmpty()
  rating: number;
}

export class GetGivenRatesResDto {
  @IsArray()
  @Type(() => GivenRateDto)
  @ValidateNested({ each: true })
  rates: GivenRateDto[];
}
