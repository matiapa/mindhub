import { IsNotEmpty } from 'class-validator';

export class PostRateDto {
  @IsNotEmpty()
  rateeId: string;

  @IsNotEmpty()
  rating: number;
}
