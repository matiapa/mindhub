import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Gender, SignupState } from '../entities/user.entity';
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
}

export class OwnUserInfo {
  @Type(() => Profile)
  @ValidateNested()
  @IsNotEmpty()
  profile: Profile;

  @IsEnum(SignupState)
  @IsNotEmpty()
  signupState: SignupState;
}

export class GetOwnUserResDto extends OwnUserInfo {}
