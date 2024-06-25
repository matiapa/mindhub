import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProcessingSummaryDto {
  @IsNumber()
  @IsOptional()
  interests?: number;

  @IsNumber()
  @IsOptional()
  texts?: number;
}

class LastProcessedDto {
  @IsBoolean()
  @IsNotEmpty()
  success: boolean;

  @IsString()
  @IsOptional()
  error?: string;

  @Type(() => ProcessingSummaryDto)
  @ValidateNested()
  @IsOptional()
  summary?: ProcessingSummaryDto;

  @IsDate()
  @IsNotEmpty()
  date: Date;
}

class ProviderConnectionDto {
  @IsString()
  @IsNotEmpty()
  provider: string;

  oauth?: {
    date: Date;
  };

  file?: {
    date: Date;
  };

  @Type(() => LastProcessedDto)
  @ValidateNested()
  @IsOptional()
  lastProcessed?: LastProcessedDto;
}

export class GetProviderConnsResDto {
  @Type(() => ProviderConnectionDto)
  @ValidateNested({ each: true })
  @IsNotEmpty()
  connections: ProviderConnectionDto[];
}
