import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ReviewRecommendationReqDto {
  @IsBoolean()
  @IsNotEmpty()
  accept: boolean;
}
