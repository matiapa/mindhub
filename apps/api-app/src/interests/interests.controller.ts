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

@Controller('/interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Post('/')
  @ApiOperation({ summary: 'Create an interest relationship' })
  @ApiCreatedResponse({ description: 'OK' })
  async create(@Body() dto: CreateInterestDto): Promise<void> {
    return this.interestsService.create({
      userId: dto.userId,
      resourceId: dto.resourceId,
    });
  }

  @Get('/shared')
  @ApiOperation({ summary: 'Get resources on which two users share interest' })
  @ApiOkResponse({ description: 'OK', type: GetSharedInterestsResDto })
  getShared(
    @Query() dto: GetSharedInterestsDto,
  ): Promise<GetSharedInterestsResDto> {
    return this.interestsService.getSharedInterests(
      dto.userA,
      dto.userB,
      dto.includeResourceData,
    );
  }

  @Get('/:userId')
  @ApiOperation({ summary: 'Get the interests of a user' })
  @ApiOkResponse({ description: 'OK', type: GetUserInterestsResDto })
  getOwn(
    @Param('userId') userId: string,
    @Query() dto: GetUserInterestsDto,
  ): Promise<GetUserInterestsResDto> {
    return this.interestsService.getUserInterests(
      userId,
      dto.includeResourceData,
    );
  }

  @Delete('/:userId/:resourceId')
  @ApiOperation({ summary: 'Delete an interest relationship' })
  @ApiCreatedResponse({ description: 'OK' })
  async delete(
    @Param('userId') userId: string,
    @Param('resourceId') resourceId: string,
  ): Promise<void> {
    return this.interestsService.remove(userId, resourceId);
  }
}
