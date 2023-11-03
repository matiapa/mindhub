import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsArray,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  PaginatedReqDto,
  PaginatedResDto,
} from 'libs/utils/dtos/paginated.dto';
import { Recommendation, RecommendationScore } from '../entities/recommendation.entity';
import { RecommendationPriority } from '../enums/recommendation-priority.enum';

export class RecommendationDto
  implements Omit<Recommendation, 'targetUserId' | 'reviewed'>
{
  @IsString()
  @IsNotEmpty()
  recommendedUserId: string;

  @Type(() => RecommendationScore)
  @ValidateNested()
  score: RecommendationScore;
}

export class GetRecommendationsReqDto extends PaginatedReqDto {
  @IsEnum(RecommendationPriority)
  @IsNotEmpty()
  priority: RecommendationPriority;
}

export class GetRecommendationsResDto extends PaginatedResDto {
  @IsArray()
  @Type(() => RecommendationDto)
  @ValidateNested({ each: true })
  recommendations: RecommendationDto[];
}
