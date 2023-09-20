import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Controller, Get, Post, Body, Query, Put, Param } from '@nestjs/common';
import {
  GetFriendshipsDto,
  ProposeFriendshipDto,
  ReviewRequestDto,
} from './dtos';
import { FriendshipsService } from './friendships.service';
import { UserInfo } from 'src/features/users';

@Controller('friendships')
export class FriendshipsController {
  constructor(private readonly friendshipsService: FriendshipsService) {}

  @Post()
  @ApiOperation({ summary: 'Send a friendship request' })
  @ApiCreatedResponse({ description: 'OK' })
  proposeFriendship(@Body() dto: ProposeFriendshipDto): Promise<void> {
    return this.friendshipsService.proposeFriendship(dto.target);
  }

  @Get()
  @ApiOperation({
    summary: 'Get friendships, either accepted ones, or sent/received requests',
  })
  @ApiOkResponse({ description: 'OK', type: Array<UserInfo> })
  getFriendships(@Query() dto: GetFriendshipsDto): Promise<UserInfo[]> {
    return this.friendshipsService.getFriendships(dto.type, {
      optionalFields: dto.optionalFields,
    });
  }

  @Put('/request/:proposerId')
  @ApiOperation({ summary: 'Accept or reject a friendship request' })
  @ApiCreatedResponse({ description: 'OK' })
  reviewRequest(
    @Param('proposerId') proposerId: string,
    @Body() dto: ReviewRequestDto,
  ): Promise<void> {
    return this.friendshipsService.reviewRequest(proposerId, dto.accept);
  }
}
