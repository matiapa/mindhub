import { IsEnum, ValidateNested, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { InterestRelevance } from '../entities/interest.entity';
import { Type } from 'class-transformer';
import { ResourceType } from '../enums/resource-type.enum';
import { ProviderEnum } from '@Feature/providers';

class CreateManualResourceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ResourceType)
  @IsNotEmpty()
  type: ResourceType;
}

export class CreateManualInterestDto {
  @IsEnum(InterestRelevance)
  @IsNotEmpty()
  relevance: InterestRelevance;

  @Type(() => CreateManualResourceDto)
  @ValidateNested()
  resource: CreateManualResourceDto;
}

class CreateProviderResourceDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ResourceType)
  @IsNotEmpty()
  type: ResourceType;
}

export class CreateProviderInterestDto {
  @IsEnum(InterestRelevance)
  @IsNotEmpty()
  relevance: InterestRelevance;

  @Type(() => CreateProviderResourceDto)
  @ValidateNested()
  resource: CreateProviderResourceDto;

  @IsEnum(ProviderEnum)
  @IsNotEmpty()
  provider: ProviderEnum;
}
