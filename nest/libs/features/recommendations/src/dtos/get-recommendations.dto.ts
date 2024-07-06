import {
  IsNotEmpty,
  ValidateNested,
  IsArray,
  IsEnum,
  IsOptional,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  PaginatedReqDto,
  PaginatedResDto,
} from 'libs/utils/dtos/paginated.dto';
import {
  Recommendation,
  RecommendationScore,
} from '../entities/recommendation.entity';
import { RecommendationPriority } from '../enums/recommendation-priority.enum';
import { SharedUserInfo } from '@Feature/users';
import { OptUserInfoFields } from '@Feature/users/dto';
import { ApiProperty } from '@nestjs/swagger';

export class RecommendationDto
  implements
    Omit<Recommendation, 'recommendedUserId' | 'targetUserId' | 'reviewed'>
{
  @Type(() => SharedUserInfo)
  @ValidateNested()
  user: SharedUserInfo;

  @Type(() => RecommendationScore)
  @ValidateNested()
  score: RecommendationScore;

  @IsDate()
  @IsNotEmpty()
  generatedAt: Date;
}

export class GetRecommendationsReqDto extends PaginatedReqDto {
  @IsEnum(RecommendationPriority)
  @IsNotEmpty()
  priority: RecommendationPriority;

  @IsArray()
  @IsEnum(OptUserInfoFields, { each: true })
  @IsOptional()
  @ApiProperty({ name: 'optionalFields[]' })
  optionalFields: OptUserInfoFields[] = [];
}

export class GetRecommendationsResDto extends PaginatedResDto {
  @IsArray()
  @Type(() => RecommendationDto)
  @ValidateNested({ each: true })
  recommendations: RecommendationDto[];
}
