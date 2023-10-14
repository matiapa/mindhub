import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Gender } from '../entities/user.entity';

export class UpdateProfileReqDto {
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsDateString()
  @IsNotEmpty()
  birthday: string;

  @IsString()
  @IsOptional()
  biography?: string;
}
