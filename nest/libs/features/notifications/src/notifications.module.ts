import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './notifications.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './entities/notification.entity';
import { QueueModule } from '@Provider/queue';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    QueueModule
  ],
  providers: [NotificationsService, NotificationsRepository],
  exports: [NotificationsService],
})
export class NotificationsModule {}
