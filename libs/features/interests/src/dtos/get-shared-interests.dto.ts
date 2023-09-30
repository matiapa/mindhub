import { ResourceDto } from '@Feature/resources';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GetSharedInterestsDto {
  @IsString()
  @IsNotEmpty()
  userA: string;

  @IsString()
  @IsNotEmpty()
  userB: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @IsNotEmpty()
  includeResourceData: boolean;
}

export class GetSharedInterestsResDto {
  @IsArray()
  @IsString({ each: true })
  resourceIds?: string[];

  @IsArray()
  @Type(() => ResourceDto)
  @ValidateNested({ each: true })
  resources?: ResourceDto[];
}
