import {
  InterestsService,
  CreateInterestDto,
  GetSharedInterestsDto,
  GetUserInterestsDto,
  GetSharedInterestsResDto,
  GetUserInterestsResDto,
} from '@Feature/interests';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { AuthenticationService } from '@Provider/authentication';

@Controller('/interests')
export class InterestsController {
  constructor(
    private readonly interestsService: InterestsService,
    private readonly authService: AuthenticationService,
  ) {}

  @Post('/')
  @ApiOperation({ summary: 'Create an interest relationship' })
  @ApiCreatedResponse({ description: 'OK' })
  async create(@Body() dto: CreateInterestDto): Promise<void> {
    return this.interestsService.create({
      userId: this.authService.getAuthenticadedUserId(),
      resourceId: dto.resourceId,
      relevance: dto.relevance,
    });
  }

  @Get('/shared')
  @ApiOperation({
    summary:
      'Get interests of a user that are shared with the ones of the authenticated user',
  })
  @ApiOkResponse({ description: 'OK', type: GetSharedInterestsResDto })
  getShared(
    @Query() dto: GetSharedInterestsDto,
  ): Promise<GetSharedInterestsResDto> {
    return this.interestsService.getSharedInterests(
      this.authService.getAuthenticadedUserId(),
      dto.userId,
    );
  }

  @Get('/me')
  @ApiOperation({ summary: 'Get the interests of the authenticated user' })
  @ApiOkResponse({ description: 'OK', type: GetUserInterestsResDto })
  getOwn(@Query() dto: GetUserInterestsDto): Promise<GetUserInterestsResDto> {
    return this.interestsService.getUserInterests(
      this.authService.getAuthenticadedUserId(),
      dto.includeResourceData,
    );
  }

  @Delete('/resourceId')
  @ApiOperation({ summary: 'Delete an interest relationship' })
  @ApiCreatedResponse({ description: 'OK' })
  async delete(@Param('resourceId') resourceId: string): Promise<void> {
    return this.interestsService.remove(
      this.authService.getAuthenticadedUserId(),
      resourceId,
    );
  }
}