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

class ConnectionDto {
  @IsDate()
  @IsNotEmpty()
  date: Date;
}

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

  @Type(() => ConnectionDto)
  @ValidateNested()
  @IsOptional()
  oauth?: ConnectionDto;

  @Type(() => ConnectionDto)
  @ValidateNested()
  @IsOptional()
  file?: ConnectionDto;

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
