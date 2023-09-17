import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Gender } from '../entities/user.entity';

export class GetUserResDto {
  @IsString()
  @IsNotEmpty()
  _id: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsNumber()
  @IsNotEmpty()
  age: number;

  @IsString()
  @IsOptional()
  biography?: string;

  @IsNumber()
  @IsOptional()
  distance?: number;

  @IsUrl()
  @IsOptional()
  pictureUrl?: string;
}
