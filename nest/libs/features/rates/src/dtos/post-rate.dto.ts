import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PostRateDto {
  @IsString()
  @IsNotEmpty()
  rateeId: string;

  @IsNumber()
  @IsNotEmpty()
  rating: number;
}
