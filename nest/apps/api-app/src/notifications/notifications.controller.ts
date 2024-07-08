import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Body, UseGuards, Put, Post, Query } from '@nestjs/common';
import { NotificationsService, GetNotificationsResDto, CreateAppNotificationDto, GetNotificationsReqDto } from '@Feature/notifications';
import {
  AuthGuard,
  AuthUser,
} from '@Provider/authentication/authentication.guard';
import { PrincipalData } from '@Provider/authentication/authentication.types';
import { MarkNotificationsSeen } from '@Feature/notifications/dtos/mark-notifications-seen.dto';
import { SaveWebPushSubscriptionDto } from '@Feature/notifications/dtos/save-webpush-subscription.dto';
import { SendWebPushEventDto } from '@Feature/notifications/dtos/send-webpush-event';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // @Post("/webpush/event")
  // @ApiOperation({ summary: 'Send webpush event' })
  // @UseGuards(AuthGuard)
  // sendWebPushEvent(
  //   @Body() dto: SendWebPushEventDto,
  //   @AuthUser() user: PrincipalData,
  // ): Promise<void> {
  //   return this.notificationsService.sendWebPushEvent(dto);
  // }

  @Post("/webpush/subscription")
  @ApiOperation({ summary: 'Save a webpush subscription' })
  @UseGuards(AuthGuard)
  saveWebPushSubscription(
    @Body() dto: SaveWebPushSubscriptionDto,
    @AuthUser() user: PrincipalData,
  ): Promise<void> {
    return this.notificationsService.saveWebPushSubscription(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get app notifications' })
  @UseGuards(AuthGuard)
  getAppNotifications(
    @Query() dto: GetNotificationsReqDto,
    @AuthUser() user: PrincipalData,
  ): Promise<GetNotificationsResDto> {
    return this.notificationsService.getAppNotifications(user.id, dto.onlyNew === "true");
  }

  @Put()
  @ApiOperation({ summary: 'Mark app notifications as seen' })
  @UseGuards(AuthGuard)
  markSeen(
    @Body() dto: MarkNotificationsSeen,
    @AuthUser() user: PrincipalData,
  ): Promise<void> {
    return this.notificationsService.markSeen(dto, user.id);
  }
}

