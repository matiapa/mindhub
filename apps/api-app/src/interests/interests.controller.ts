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
  UseGuards,
} from '@nestjs/common';
import {
  AuthGuard,
  AuthUser,
} from '@Provider/authentication/authentication.guard';
import {
  InterestsService,
  GetSharedInterestsResDto,
  GetSharedInterestsDto,
} from '@Feature/interests';
import {
  CreateInterestDto,
  GetInterestsResDto,
} from '@Feature/interests/dtos/interest.dto';
import { PrincipalData } from '@Provider/authentication/authentication.types';

@Controller('/interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Post('/')
  @ApiOperation({ summary: 'Create an interest relationship' })
  @ApiCreatedResponse({ description: 'OK' })
  @UseGuards(AuthGuard)
  async create(
    @Body() dto: CreateInterestDto,
    @AuthUser() user: PrincipalData,
  ): Promise<void> {
    return this.interestsService.create({
      userId: user.id,
      resourceId: dto.resourceId,
      relevance: dto.relevance,
      provider: dto.provider,
      resource: dto.resource,
    });
  }

  @Get('/shared')
  @ApiOperation({
    summary:
      'Get interests of a user that are shared with the ones of the authenticated user',
  })
  @ApiOkResponse({ description: 'OK', type: GetSharedInterestsResDto })
  @UseGuards(AuthGuard)
  getShared(
    @Query() dto: GetSharedInterestsDto,
    @AuthUser() user: PrincipalData,
  ): Promise<GetSharedInterestsResDto> {
    return this.interestsService.getSharedInterests(user.id, dto.userId);
  }

  @Get('/me')
  @ApiOperation({ summary: 'Get the interests of the authenticated user' })
  @ApiOkResponse({ description: 'OK', type: GetInterestsResDto })
  @UseGuards(AuthGuard)
  getOwn(@AuthUser() user: PrincipalData): Promise<GetInterestsResDto> {
    return this.interestsService.getUserInterests(user.id);
  }

  @Delete('/:resourceId')
  @ApiOperation({ summary: 'Delete an interest relationship' })
  @ApiCreatedResponse({ description: 'OK' })
  @UseGuards(AuthGuard)
  async delete(
    @Param('resourceId') resourceId: string,
    @AuthUser() user: PrincipalData,
  ): Promise<void> {
    return this.interestsService.remove(user.id, resourceId);
  }
}
