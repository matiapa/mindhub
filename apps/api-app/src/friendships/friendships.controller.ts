import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Controller, Get, Post, Body, Query, Put, Param } from '@nestjs/common';

import { SharedUserInfo } from '@Feature/users';
import {
  ProposeFriendshipDto,
  GetFriendshipsDto,
  ReviewRequestDto,
} from '@Feature/friendships/dtos';
import { FriendshipsService } from '@Feature/friendships/friendships.service';
import { AuthenticationService } from '@Provider/authentication';

@Controller('friendships')
export class FriendshipsController {
  constructor(
    private readonly friendshipsService: FriendshipsService,
    private readonly authService: AuthenticationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Send a friendship request' })
  @ApiCreatedResponse({ description: 'OK' })
  proposeFriendship(@Body() dto: ProposeFriendshipDto): Promise<void> {
    return this.friendshipsService.proposeFriendship(
      this.authService.getAuthenticadedUserId(),
      dto.target,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get friendships, either accepted ones, or sent/received requests',
  })
  @ApiOkResponse({ description: 'OK', type: Array<SharedUserInfo> })
  getFriendships(@Query() dto: GetFriendshipsDto): Promise<SharedUserInfo[]> {
    return this.friendshipsService.getFriendships(
      this.authService.getAuthenticadedUserId(),
      dto.type,
      {
        optionalFields: dto.optionalFields,
      },
    );
  }

  @Put('/request/:proposerId')
  @ApiOperation({ summary: 'Accept or reject a friendship request' })
  @ApiCreatedResponse({ description: 'OK' })
  reviewRequest(
    @Param('proposerId') proposerId: string,
    @Body() dto: ReviewRequestDto,
  ): Promise<void> {
    return this.friendshipsService.reviewRequest(
      this.authService.getAuthenticadedUserId(),
      proposerId,
      dto.accept,
    );
  }
}
