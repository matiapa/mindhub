import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ReviewRecommendationDto {
  @IsBoolean()
  @IsNotEmpty()
  accept: boolean;
}
