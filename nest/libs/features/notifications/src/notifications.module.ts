import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './repositories/notifications.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './entities/notification.entity';
import { QueueModule } from '@Provider/queue';
import { NotificationSubscriptionsRepository } from './repositories/notification-subscriptions.repository';
import { NotificationSubscription, NotificationSubscriptionSchema } from './entities/notification-subscription.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    MongooseModule.forFeature([{ name: NotificationSubscription.name, schema: NotificationSubscriptionSchema }]),
    QueueModule
  ],
  providers: [NotificationsService, NotificationSubscriptionsRepository, NotificationsRepository],
  exports: [NotificationsService],
})
export class NotificationsModule {}
