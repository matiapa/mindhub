import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  PaginatedReqDto,
  PaginatedResDto,
} from 'libs/utils/dtos/paginated.dto';
import { Recommendation, RecommendationScore } from '../entities/recommendation.entity';
import { ResourceType } from '@Feature/interests/enums/resource-type.enum';


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

export class GetRecommendationsReqDto extends PaginatedReqDto {}

export class GetRecommendationsResDto extends PaginatedResDto {
  @IsArray()
  @Type(() => RecommendationDto)
  @ValidateNested({ each: true })
  recommendations: RecommendationDto[];
}
