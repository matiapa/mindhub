import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Gender } from '../entities/user.entity';

export enum OptUserInfoFields {
  DISTANCE = 'distance',
  PICTURE_URL = 'pictureUrl',
}

export class UserInfoConfig {
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

export class UserInfo {
  @IsString()
  @IsNotEmpty()
  _id: string;

  @IsNotEmpty()
  profile: Profile;

  @IsNumber()
  @IsOptional()
  distance?: number;

  @IsUrl()
  @IsOptional()
  pictureUrl?: string;
}

export class GetUserResDto extends UserInfo {}

export class GetUsersResDto {
  users: UserInfo[];
}
