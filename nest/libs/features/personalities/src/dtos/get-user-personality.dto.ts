import { IsNotEmpty, IsNumber } from 'class-validator';
import { Personality } from '../entities/personality.entity';

export class UserPersonalityDto implements Omit<Personality, 'userId'> {
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
}

export class GetUserPersonalityDto extends UserPersonalityDto {}
