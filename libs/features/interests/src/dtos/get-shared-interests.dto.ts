import { ResourceDto } from '@Feature/resources';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { InterestRelevance } from '../interest.entity';

export class GetSharedInterestsDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @IsNotEmpty()
  includeResourceData: boolean;
}

export class SharedInterestDto {
  @IsEnum(InterestRelevance)
  relevanceForUserA: InterestRelevance;

  @IsEnum(InterestRelevance)
  relevanceForUserB: InterestRelevance;

  @Type(() => ResourceDto)
  @ValidateNested()
  resource: ResourceDto;
}

export class GetSharedInterestsResDto {
  @IsArray()
  @Type(() => ResourceDto)
  @ValidateNested({ each: true })
  sharedInterests: SharedInterestDto[];
}
