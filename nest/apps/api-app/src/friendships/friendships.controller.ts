import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Put,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';

import {
  ProposeFriendshipDto,
  GetFriendshipsReqDto,
  ReviewRequestDto,
  GetFriendshipsResDto,
} from '@Feature/friendships/dtos';
import { FriendshipsService } from '@Feature/friendships/friendships.service';
import {
  AuthGuard,
  AuthUser,
} from '@Provider/authentication/authentication.guard';
import { PrincipalData } from '@Provider/authentication/authentication.types';

@ApiTags('Friendships')
@ApiBearerAuth()
@Controller('friendships')
export class FriendshipsController {
  constructor(private readonly friendshipsService: FriendshipsService) {}

  @Post('/proposal')
  @ApiOperation({ summary: 'Send a friendship request' })
  @UseGuards(AuthGuard)
  proposeFriendship(
    @Body() dto: ProposeFriendshipDto,
    @AuthUser() user: PrincipalData,
  ): Promise<void> {
    return this.friendshipsService.proposeFriendship(user.id, dto.target);
  }

  @Delete('/proposal/:targetId')
  @ApiOperation({ summary: 'Cancel a friendship request' })
  @UseGuards(AuthGuard)
  cancelProposal(
    @Param('targetId') targetId: string,
    @AuthUser() user: PrincipalData,
  ): Promise<void> {
    return this.friendshipsService.cancelProposal(user.id, targetId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get friendships, either accepted ones, or sent/received requests',
  })
  @UseGuards(AuthGuard)
  getFriendships(
    @Query() dto: GetFriendshipsReqDto,
    @AuthUser() user: PrincipalData,
  ): Promise<GetFriendshipsResDto> {
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
