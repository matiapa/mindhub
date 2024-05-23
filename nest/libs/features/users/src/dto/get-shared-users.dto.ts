import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Gender } from '../entities/user.entity';
import { Type } from 'class-transformer';
import { SharedInterestDto } from '@Feature/interests';
import { UserPersonalityDto } from '@Feature/personalities';

export enum OptUserInfoFields {
  DISTANCE = 'distance',
  PICTURE_URL = 'pictureUrl',
  SHARED_INTERESTS = 'sharedInterests',
  PERSONALITY = 'personality',
}

export class SharedUserInfoConfig {
  @IsArray()
  @IsEnum(OptUserInfoFields, { each: true })
  @IsOptional()
  optionalFields: OptUserInfoFields[] = [];
}

class Profile {
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

  @IsNotEmpty()
  profile: Profile;

  @IsNumber()
  @IsOptional()
  distance?: number;

  @IsNumber()
  @IsNotEmpty()
  inactiveHours: number;

  @IsUrl()
  @IsOptional()
  pictureUrl?: string;

  @IsOptional()
  personality?: UserPersonalityDto;

  @IsArray()
  @Type(() => SharedInterestDto)
  @ValidateNested({ each: true })
  sharedInterests?: SharedInterestDto[];
}

export class GetSharedUserResDto extends SharedUserInfo {}

export class GetSharedUsersResDto {
  users: SharedUserInfo[];
}
