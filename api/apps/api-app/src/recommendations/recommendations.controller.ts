import { RecommendationsService } from '@Feature/recommendations';
import {
  GetRecommendationsReqDto,
  GetRecommendationsResDto,
} from '@Feature/recommendations/dtos/get-recommendations.dto';
import { ReviewRecommendationReqDto } from '@Feature/recommendations/dtos/review-recommendation.dto';
import {
  AuthGuard,
  AuthUser,
} from '@Provider/authentication/authentication.guard';
import { PrincipalData } from '@Provider/authentication/authentication.types';
import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Recommendations')
@ApiBearerAuth()
@Controller('/recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get('/')
  @ApiOperation({ summary: 'Get friendship recommendations' })
  @UseGuards(AuthGuard)
  getRecommendations(
    @Query() dto: GetRecommendationsReqDto,
    @AuthUser() user: PrincipalData,
  ): Promise<GetRecommendationsResDto> {
    return this.recommendationsService.getRecommendations(dto, user.id);
  }

  @Put('/:recommendedUserId')
  @ApiOperation({ summary: 'Accept or discard a friendship recommendation' })
  @UseGuards(AuthGuard)
  reviewRecommendation(
    @Param('recommendedUserId') recommendedUserId: string,
    @Body() dto: ReviewRecommendationReqDto,
    @AuthUser() user: PrincipalData,
  ) {
    return this.recommendationsService.reviewRecommendation(
      user.id,
      recommendedUserId,
      dto,
    );
  }
}
