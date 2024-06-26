import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Text } from '../entities/text.entity';
import { Type } from 'class-transformer';
import { ProviderEnum } from '@Feature/providers';
import {
  PaginatedReqDto,
  PaginatedResDto,
} from 'libs/utils/dtos/paginated.dto';

export class UserTextDto implements Omit<Text, '_id' | 'userId'> {
  @IsUUID()
  @IsNotEmpty()
  _id: string;

  @IsEnum(ProviderEnum)
  @IsNotEmpty()
  provider: ProviderEnum;

  @IsString()
  @IsNotEmpty()
  rawText: string;

  @IsString()
  @IsNotEmpty()
  language: string;

  @IsDate()
  @IsNotEmpty()
  date?: Date;
}

export class GetUserTextsReqDto extends PaginatedReqDto {
  @IsString()
  @IsOptional()
  subtext?: string;
}

export class GetUserTextsResDto extends PaginatedResDto {
  @IsArray()
  @Type(() => UserTextDto)
  @ValidateNested({ each: true })
  texts: UserTextDto[];
}
