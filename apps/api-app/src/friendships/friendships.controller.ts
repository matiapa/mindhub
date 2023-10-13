import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Put,
  Param,
  UseGuards,
} from '@nestjs/common';

import { SharedUserInfo } from '@Feature/users';
import {
  ProposeFriendshipDto,
  GetFriendshipsDto,
  ReviewRequestDto,
} from '@Feature/friendships/dtos';
import { FriendshipsService } from '@Feature/friendships/friendships.service';
import {
  AuthGuard,
  AuthUser,
} from '@Provider/authentication/authentication.guard';
import { PrincipalData } from '@Provider/authentication/authentication.types';

@Controller('friendships')
export class FriendshipsController {
  constructor(private readonly friendshipsService: FriendshipsService) {}

  @Post()
  @ApiOperation({ summary: 'Send a friendship request' })
  @ApiCreatedResponse({ description: 'OK' })
  @UseGuards(AuthGuard)
  proposeFriendship(
    @Body() dto: ProposeFriendshipDto,
    @AuthUser() user: PrincipalData,
  ): Promise<void> {
    return this.friendshipsService.proposeFriendship(user.id, dto.target);
  }

  @Get()
  @ApiOperation({
    summary: 'Get friendships, either accepted ones, or sent/received requests',
  })
  @ApiOkResponse({ description: 'OK', type: Array<SharedUserInfo> })
  @UseGuards(AuthGuard)
  getFriendships(
    @Query() dto: GetFriendshipsDto,
    @AuthUser() user: PrincipalData,
  ): Promise<SharedUserInfo[]> {
    return this.friendshipsService.getFriendshipsWithUserInfo(
      user.id,
      dto.type,
      {
        optionalFields: dto.optionalFields,
      },
    );
  }

  @Put('/request/:proposerId')
  @ApiOperation({ summary: 'Accept or reject a friendship request' })
  @ApiCreatedResponse({ description: 'OK' })
  @UseGuards(AuthGuard)
  reviewRequest(
    @Param('proposerId') proposerId: string,
    @Body() dto: ReviewRequestDto,
    @AuthUser() user: PrincipalData,
  ): Promise<void> {
    return this.friendshipsService.reviewRequest(
      user.id,
      proposerId,
      dto.accept,
    );
  }
}
