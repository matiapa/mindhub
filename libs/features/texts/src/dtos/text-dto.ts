import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ITextData } from '../entities/text.entity';
import { Type } from 'class-transformer';
import { ProviderEnum } from '@Feature/providers';

export class TextDto
  implements Pick<ITextData, 'provider' | 'rawText' | 'language' | 'date'>
{
  @IsEnum(ProviderEnum)
  @IsNotEmpty()
  provider: ProviderEnum;

  @IsString()
  @IsNotEmpty()
  rawText: string;

  @IsString()
  @IsNotEmpty()
  language: string;

  @IsDateString()
  @IsNotEmpty()
  date?: string;
}

export class GetTextsResDto {
  @IsArray()
  @Type(() => TextDto)
  @ValidateNested({ each: true })
  texts: TextDto[];
}

export class CreateTextDto implements Pick<ITextData, 'rawText' | 'language'> {
  @IsString()
  @IsNotEmpty()
  rawText: string;

  @IsString()
  @IsNotEmpty()
  language: string; // ISO 639-1 code
}
