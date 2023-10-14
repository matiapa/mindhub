import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Interest, InterestRelevance } from '../entities/interest.entity';
import { ResourceDto } from './resource.dto';

export class GetSharedInterestsReqDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

class RelevanceDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(InterestRelevance)
  @IsNotEmpty()
  relevance: InterestRelevance;
}

export class SharedInterestDto implements Pick<Interest, 'resource'> {
  @Type(() => ResourceDto)
  @ValidateNested()
  resource: ResourceDto;

  @Type(() => RelevanceDto)
  @ValidateNested({ each: true })
  relevances: RelevanceDto[];
}

export class GetSharedInterestsResDto {
  @IsArray()
  @Type(() => SharedInterestDto)
  @ValidateNested({ each: true })
  sharedInterests: SharedInterestDto[];
}
