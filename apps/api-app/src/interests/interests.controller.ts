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
  GetSharedInterestsReqDto,
  CreateInterestDto,
} from '@Feature/interests';
import {
  GetUserInterestsReqDto,
  GetUserInterestsResDto,
} from '@Feature/interests/dtos/get-user-interests.dto';
import { PrincipalData } from '@Provider/authentication/authentication.types';
import { ProviderEnum } from '@Feature/providers';

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
    return this.interestsService.upsertMany([
      {
        userId: user.id,
        relevance: dto.relevance,
        provider: ProviderEnum.USER,
        resource: dto.resource,
        date: new Date(),
      },
    ]);
  }

  @Get('/shared')
  @ApiOperation({
    summary:
      'Get interests of a user that are shared with the ones of the authenticated user',
  })
  @ApiOkResponse({ description: 'OK', type: GetSharedInterestsResDto })
  @UseGuards(AuthGuard)
  getShared(
    @Query() dto: GetSharedInterestsReqDto,
    @AuthUser() user: PrincipalData,
  ): Promise<GetSharedInterestsResDto> {
    return this.interestsService.getSharedInterests([user.id, dto.userId]);
  }

  @Get('/me')
  @ApiOperation({ summary: 'Get the interests of the authenticated user' })
  @ApiOkResponse({ description: 'OK', type: GetUserInterestsResDto })
  @UseGuards(AuthGuard)
  getOwn(
    @Query() dto: GetUserInterestsReqDto,
    @AuthUser() user: PrincipalData,
  ): Promise<GetUserInterestsResDto> {
    return this.interestsService.getUserInterests(dto, user.id);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete an interest relationship' })
  @ApiCreatedResponse({ description: 'OK' })
  @UseGuards(AuthGuard)
  async delete(
    @Param('id') id: string,
    @AuthUser() user: PrincipalData,
  ): Promise<void> {
    return this.interestsService.remove(id, user.id);
  }
}
