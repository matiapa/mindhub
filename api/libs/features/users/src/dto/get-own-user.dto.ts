import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Gender } from '../entities/user.entity';

class Profile {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsDate()
  @IsNotEmpty()
  birthday: Date;

  @IsString()
  @IsOptional()
  biography?: string;
}

export class OwnUserInfo {
  @IsNotEmpty()
  profile: Profile;

  @IsUrl()
  @IsOptional()
  pictureUrl?: string;
}

export class GetOwnUserResDto extends OwnUserInfo {}
