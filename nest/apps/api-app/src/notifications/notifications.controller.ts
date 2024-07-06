import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Body, UseGuards, Put } from '@nestjs/common';
import { NotificationsService, GetNotificationsResDto } from '@Feature/notifications';
import {
  AuthGuard,
  AuthUser,
} from '@Provider/authentication/authentication.guard';
import { PrincipalData } from '@Provider/authentication/authentication.types';
import { MarkNotificationsSeen } from '@Feature/notifications/dtos/mark-notifications-seen.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Put()
  @ApiOperation({ summary: 'Mak notifications as seen' })
  @UseGuards(AuthGuard)
  markSeen(
    @Body() dto: MarkNotificationsSeen,
    @AuthUser() user: PrincipalData,
  ): Promise<void> {
    return this.notificationsService.markSeen(dto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get notifications',
  })
  @UseGuards(AuthGuard)
  getNotifications(
    @AuthUser() user: PrincipalData,
  ): Promise<GetNotificationsResDto> {
    return this.notificationsService.getNotifications(user.id);
  }
}

