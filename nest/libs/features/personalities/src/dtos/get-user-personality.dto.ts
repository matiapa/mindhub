import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Personality } from '../entities/personality.entity';

export class UserPersonalityDto implements Omit<Personality, 'userId'> {
  @IsString()
  @IsNotEmpty()
  userId?: string;

  @IsNumber()
  @IsNotEmpty()
  o: number;

  @IsNumber()
  @IsNotEmpty()
  c: number;

  @IsNumber()
  @IsNotEmpty()
  e: number;

  @IsNumber()
  @IsNotEmpty()
  a: number;

  @IsNumber()
  @IsNotEmpty()
  n: number;

  @IsDate()
  @IsNotEmpty()
  generatedAt: Date;
}

export class GetUserPersonalityDto extends UserPersonalityDto {}
