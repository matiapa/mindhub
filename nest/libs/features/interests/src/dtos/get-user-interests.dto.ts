import {
  IsString,
  IsNotEmpty,
  IsEnum,
  ValidateNested,
  IsArray,
  IsDate,
  IsUUID,
} from 'class-validator';
import { Interest, InterestRelevance } from '../entities/interest.entity';
import { ProviderEnum } from '@Feature/providers';
import { Type } from 'class-transformer';
import { ResourceDto } from './resource.dto';
import {
  PaginatedReqDto,
  PaginatedResDto,
} from 'libs/utils/dtos/paginated.dto';

export class UserInterestDto implements Omit<Interest, 'userId'> {
  @IsUUID()
  @IsNotEmpty()
  _id: string;

  @IsString()
  @IsEnum(ProviderEnum)
  provider: ProviderEnum;

  @IsEnum(InterestRelevance)
  @IsNotEmpty()
  relevance: InterestRelevance;

  @Type(() => ResourceDto)
  @ValidateNested()
  resource: ResourceDto;

  @IsDate()
  @IsNotEmpty()
  date: Date;
}

export class GetUserInterestsReqDto extends PaginatedReqDto {}

export class GetUserInterestsResDto extends PaginatedResDto {
  @IsArray()
  @Type(() => UserInterestDto)
  @ValidateNested({ each: true })
  interests: UserInterestDto[];
}
