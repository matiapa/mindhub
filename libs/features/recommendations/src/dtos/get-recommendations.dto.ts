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
import { Recommendation } from '../entities/recommendation.entity';
import { ResourceType } from '@Feature/interests/enums/resource-type.enum';

class InterestScoresDto {
  @IsNumber()
  @IsNotEmpty()
  global: number;

  @IsNumber()
  @IsNotEmpty()
  [ResourceType.ARTIST]: number;

  @IsNumber()
  @IsNotEmpty()
  [ResourceType.TRACK]: number;
}

export class RecommendationDto
  implements Omit<Recommendation, 'targetUserId' | 'reviewed'>
{
  @IsString()
  @IsNotEmpty()
  recommendedUserId: string;

  @Type(() => InterestScoresDto)
  @ValidateNested()
  scores: InterestScoresDto;
}

export class GetRecommendationsReqDto extends PaginatedReqDto {}

export class GetRecommendationsResDto extends PaginatedResDto {
  @IsArray()
  @Type(() => RecommendationDto)
  @ValidateNested({ each: true })
  recommendations: RecommendationDto[];
}
