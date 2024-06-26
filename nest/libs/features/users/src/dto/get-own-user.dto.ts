import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Gender } from '../entities/user.entity';
import { Type } from 'class-transformer';

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

  @IsBoolean()
  @IsNotEmpty()
  completed: boolean;
}

export class OwnUserInfo {
  @Type(() => Profile)
  @ValidateNested()
  @IsNotEmpty()
  profile: Profile;
}

export class GetOwnUserResDto extends OwnUserInfo {}
