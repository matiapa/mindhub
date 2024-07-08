import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from './repositories/notifications.repository';
import {
  GetNotificationsResDto,
} from './dtos/get-notifications.dto';
import { ObjectId } from 'bson';
import { CreateAppNotificationDto } from './dtos/create-app-notification.dto';
import { MarkNotificationsSeen } from './dtos/mark-notifications-seen.dto';
import { SaveWebPushSubscriptionDto } from './dtos/save-webpush-subscription.dto';
import { NotificationSubscriptionsRepository } from './repositories/notification-subscriptions.repository';
import { ConfigService } from '@nestjs/config';
import { NotificationsConfig } from './notifications.config';
import webpush from "web-push";
import { hashObjectId } from 'libs/utils';
import { SendWebPushEventDto, WebPushEventType } from './dtos/send-webpush-event';

@Injectable()
export class NotificationsService {
  private config: NotificationsConfig;

  /* Webpush events are used to send messages to the client, for example when receiving a new chat message. Then the client can show or not a browser
    notification, and/or update the app state.

    In-app notifications are persisted entities, that the client shows in the notifications bell in addition to the browser notification. The client
    receives them either by webpush (if it supports it) or by polling (only when it's active). Sending and accepting friend requests are in-app notifications.

    In the case of sending messages, which are only notified by webpush event (it doesn't have an associated in-app notification), if the client doesn't
    support webpush then it pulls the messages endpoint to get the updates.
  */

  constructor(
    private readonly notificationSubscriptionsRepo: NotificationSubscriptionsRepository,
    private readonly notificationsRepo: NotificationsRepository,
    configService: ConfigService,
  ) {
    this.config = configService.get<NotificationsConfig>('notifications');

    webpush.setVapidDetails(
      this.config.vapidSubject,
      this.config.vapidPublicKey,
      this.config.vapidPrivateKey
    )
  }

  async saveWebPushSubscription(dto: SaveWebPushSubscriptionDto, userId: string): Promise<void> {
    const subscriptionId = hashObjectId(`${userId}|${dto.webPushSubscription.endpoint}`);
    
    await this.notificationSubscriptionsRepo.upsertMany([{
      _id: subscriptionId,
      webPushSubscription: dto.webPushSubscription,
      userId,
    }]);
  }

  async createAppNotification(dto: CreateAppNotificationDto): Promise<void> {
    const notification = {
      targetUserId: dto.targetUserId,
      type: dto.type,
      payload: dto.payload,
      date: new Date(),
      seen: false,
    };
    
    const _id = await this.notificationsRepo.createOneAndGetId(notification);
    notification['_id'] = _id;

    await this.sendWebPushEvent({
      targetUserId: dto.targetUserId,
      eventType: WebPushEventType.NEW_APP_NOTIFICATION,
      eventPayload: notification
    })
  }

  async sendWebPushEvent(dto: SendWebPushEventDto): Promise<void> {
    const subscriptions = await this.notificationSubscriptionsRepo.getMany({ userId: dto.targetUserId });
    for (const subscription of subscriptions) {
      // console.log('Sending event to', subscription.webPushSubscription.endpoint)
      
      const webSub = subscription.webPushSubscription;

      const res = await webpush.sendNotification(
        webSub,
        JSON.stringify({ eventType: dto.eventType, eventPayload: dto.eventPayload })
      );
      
      if (res.statusCode == 201) {
        // console.log(`Notification sent to ${webSub.endpoint}`);
      } else {
        console.error(`Failed to send notification to ${webSub.endpoint} with status code ${res.statusCode}`);
      }
    }
  }

  async getAppNotifications(
    userId: string,
    onlyNew: boolean = false,
  ): Promise<GetNotificationsResDto> {
    const notifications = await this.notificationsRepo.getMany(
      { targetUserId: userId, ...(onlyNew && { seen: false }) },
      { sortBy: 'date', sortOrder: 'desc' },
    );

    return {
      notifications: notifications.map((notification) => ({
        _id: (notification as any)._id.toString(),
        targetUserId: notification.targetUserId,
        type: notification.type,
        payload: notification.payload,
        date: notification.date,
        seen: notification.seen,
      }))
    };
  }

  async markSeen(
    dto: MarkNotificationsSeen,
    userId: string,
  ): Promise<void> {
    await this.notificationsRepo.updateMany(
      { _id: { $in: dto.ids.map((id) => new ObjectId(id)) }, targetUserId: userId },
      { $set: { seen: true } },
    )
  }
}
