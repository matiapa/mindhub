import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Gender } from '../entities/user.entity';
import { Type } from 'class-transformer';
import { SharedInterestDto } from '@Feature/interests';
import { UserPersonalityDto } from '@Feature/personalities';
import { ApiProperty } from '@nestjs/swagger';

export enum OptUserInfoFields {
  DISTANCE = 'distance',
  SHARED_INTERESTS = 'sharedInterests',
  PERSONALITY = 'personality',
  RATING = 'rating',
}

export class SharedUserInfoConfig {
  @IsArray()
  @IsEnum(OptUserInfoFields, { each: true })
  @IsOptional()
  @ApiProperty({ name: 'optionalFields[]' })
  optionalFields: OptUserInfoFields[] = [];
}

class ProfileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsNumber()
  @IsNotEmpty()
  age: number;

  @IsString()
  @IsOptional()
  biography?: string;
}

export class SharedUserInfo {
  @IsString()
  @IsNotEmpty()
  _id: string;

  @Type(() => ProfileDto)
  @ValidateNested()
  @IsNotEmpty()
  profile: ProfileDto;

  @IsNumber()
  @IsNotEmpty()
  inactiveHours: number;

  @IsNumber()
  @IsOptional()
  distance?: number;

  @IsArray()
  @Type(() => SharedInterestDto)
  @ValidateNested({ each: true })
  @IsOptional()
  sharedInterests?: SharedInterestDto[];

  @Type(() => UserPersonalityDto)
  @ValidateNested()
  @IsOptional()
  personality?: UserPersonalityDto;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsBoolean()
  @IsNotEmpty()
  isFake: boolean;
}

export class GetSharedUserResDto extends SharedUserInfo {}

export class GetSharedUsersResDto {
  users: SharedUserInfo[];
}
