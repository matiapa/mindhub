import { RecommendationsService } from '@Feature/recommendations';
import { ReviewRecommendationDto } from '@Feature/recommendations/dtos/review-request.dto';
import {
  AuthGuard,
  AuthUser,
} from '@Provider/authentication/authentication.guard';
import { PrincipalData } from '@Provider/authentication/authentication.types';
import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

@Controller('/recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get('/')
  @ApiOperation({ summary: 'Get friendship recommendations' })
  @ApiOkResponse({ description: 'OK' })
  @UseGuards(AuthGuard)
  getRecommendations(@AuthUser() user: PrincipalData) {
    return this.recommendationsService.getRecommendations(user.id);
  }

  @Put('/:recommendedUserId')
  @ApiOperation({ summary: 'Accept or discard a friendship recommendation' })
  @ApiCreatedResponse({ description: 'OK' })
  @UseGuards(AuthGuard)
  discardRecommendation(
    @Param('recommendedUserId') recommendedUserId: string,
    @Body() dto: ReviewRecommendationDto,
    @AuthUser() user: PrincipalData,
  ) {
    return this.recommendationsService.reviewRecommendation(
      user.id,
      recommendedUserId,
      dto,
    );
  }
}
