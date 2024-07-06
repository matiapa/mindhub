import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import {
  GetNotificationsResDto,
} from './dtos/get-notifications.dto';
import { QueueService } from '@Provider/queue';
import { ObjectId } from 'bson';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { MarkNotificationsSeen } from './dtos/mark-notifications-seen.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepo: NotificationsRepository,
    private readonly queueService: QueueService,
  ) {}

  async createNotification(dto: CreateNotificationDto): Promise<void> {
    await this.notificationsRepo.createOne({
      targetUserId: dto.targetUserId,
      type: dto.type,
      payload: dto.payload,
      date: new Date(),
      seen: false,
    });
  }

  async getNotifications(
    userId: string,
  ): Promise<GetNotificationsResDto> {
    const notifications = await this.notificationsRepo.getMany(
      { targetUserId: userId, seen: false },
      { sortBy: 'date', sortOrder: 'desc' },
    );

    return {
      notifications: notifications.map((notification) => ({
        _id: (notification as any)._id.toString(),
        targetUserId: notification.targetUserId,
        type: notification.type,
        payload: notification.payload,
        date: notification.date,
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
