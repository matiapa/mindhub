import { Module } from '@nestjs/common';
import { NotificationsModule } from '@Feature/notifications';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [NotificationsModule],
  controllers: [NotificationsController],
})
export class ApiNotificationsModule {}
