import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';

import { GetMessagesReqDto, GetMessagesResDto } from '@Feature/messages/dtos';
import { MessagesService } from '@Feature/messages/messages.service';
import {
  AuthGuard,
  AuthUser,
} from '@Provider/authentication/authentication.guard';
import { PrincipalData } from '@Provider/authentication/authentication.types';
import { PostMessageDto } from '@Feature/messages/dtos/post-message.dto';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message' })
  @UseGuards(AuthGuard)
  postMessage(
    @Body() dto: PostMessageDto,
    @AuthUser() user: PrincipalData,
  ): Promise<void> {
    return this.messagesService.sendMessage(user.id, dto.receiverId, dto.text);
  }

  @Get()
  @ApiOperation({
    summary: 'Get messages with a specific user',
  })
  @UseGuards(AuthGuard)
  getMessages(
    @Query() dto: GetMessagesReqDto,
    @AuthUser() user: PrincipalData,
  ): Promise<GetMessagesResDto> {
    return this.messagesService.getMessages(user.id, dto.counterpartyId);
  }
}
