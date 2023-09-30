import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { ResourceDto } from '@Feature/resources';
import { InterestDto } from './interest.dto';

export class GetUserInterestsDto {
  @IsBoolean()
  @IsNotEmpty()
  @Transform(({ value }) => value === 'true')
  includeResourceData: boolean;
}

export class GetUserInterestsResDto {
  @IsArray()
  @Type(() => InterestDto)
  @ValidateNested({ each: true })
  interests: InterestDto[];

  @IsArray()
  @Type(() => ResourceDto)
  @ValidateNested({ each: true })
  resources: ResourceDto[];
}
