import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsArray,
  IsNumber,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  PaginatedReqDto,
  PaginatedResDto,
} from 'libs/utils/dtos/paginated.dto';
import { Recommendation, RecommendationScore } from '../entities/recommendation.entity';
import { RecommendationPriority } from '../enums/recommendation-priority.enum';
import { SharedUserInfo, SharedUserInfoConfig } from '@Feature/users';
import { OptUserInfoFields } from '@Feature/users/dto';

export class RecommendationDto
  implements Omit<Recommendation, 'recommendedUserId' | 'targetUserId' | 'reviewed'>
{
  @Type(() => SharedUserInfo)
  @ValidateNested()
  user: SharedUserInfo;

  @Type(() => RecommendationScore)
  @ValidateNested()
  score: RecommendationScore;
}

export class GetRecommendationsReqDto extends PaginatedReqDto {
  @IsEnum(RecommendationPriority)
  @IsNotEmpty()
  priority: RecommendationPriority;

  @IsArray()
  @IsEnum(OptUserInfoFields, { each: true })
  @IsOptional()
  optionalFields: OptUserInfoFields[] = [];
}

export class GetRecommendationsResDto extends PaginatedResDto {
  @IsArray()
  @Type(() => RecommendationDto)
  @ValidateNested({ each: true })
  recommendations: RecommendationDto[];
}
