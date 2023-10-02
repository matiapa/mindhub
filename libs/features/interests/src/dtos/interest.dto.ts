import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Interest, InterestRelevance } from '../entities/interest.entity';
import { ProviderEnum } from '@Feature/providers';
import { ResourceType } from '../enums/resource-type.enum';
import { Type } from 'class-transformer';

export class ResourceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ResourceType)
  @IsNotEmpty()
  type: ResourceType;
}
export class InterestDto implements Interest {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  relevance: InterestRelevance;

  @IsString()
  @IsEnum(ProviderEnum)
  provider: ProviderEnum;

  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @Type(() => ResourceDto)
  @ValidateNested()
  resource: ResourceDto;
}

export class GetInterestResDto extends InterestDto {}

export class GetInterestsResDto {
  @IsArray()
  @Type(() => ResourceDto)
  @ValidateNested({ each: true })
  interests: InterestDto[];
}

export class CreateInterestDto {
  @IsNumber()
  relevance: InterestRelevance;

  @IsString()
  @IsEnum(ProviderEnum)
  provider: ProviderEnum;

  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @Type(() => ResourceDto)
  @ValidateNested()
  resource: ResourceDto;
}
