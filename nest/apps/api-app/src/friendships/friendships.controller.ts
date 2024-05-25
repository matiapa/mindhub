import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
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

  @Post()
  @ApiOperation({ summary: 'Send a friendship request' })
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

  @Put('/:proposerId')
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
