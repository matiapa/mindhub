import { BadRequestException, Injectable } from '@nestjs/common';
import { MessagesRepository } from './messages.repository';
import { GetMessagesResDto } from './dtos/get-given-messages.dto';
import { NotificationsService } from '@Feature/notifications';
import { NotificationType } from '@Feature/notifications/entities/notification.entity';
import { UsersService } from '@Feature/users';
import { WebPushEventType } from '@Feature/notifications/dtos/send-webpush-event';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepo: MessagesRepository,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async sendMessage(
    senderId: string,
    receiverId: string,
    text: string,
  ): Promise<void> {
    if (senderId === receiverId)
      throw new BadRequestException('Sender cannot be the same as receiver');

    const _id = await this.messagesRepo.create({
      sender: senderId,
      receiver: receiverId,
      text,
      seen: false,
    });

    // Notify the receiver about the new message

    const senderUser = await this.usersService.getUserEntity(senderId);

    await this.notificationsService.sendWebPushEvent({
      targetUserId: receiverId,
      eventType: WebPushEventType.NEW_CHAT_MESSAGE,
      eventPayload: {
        _id,
        sender: senderId,
        senderName: senderUser?.profile?.name ?? '',
        receiver: receiverId,
        text,
        createdAt: new Date(),
      },
    });
  }

  async getMessages(
    userId: string,
    counterpartyId?: string,
    onlyNew: boolean = false,
  ): Promise<GetMessagesResDto> {
    const filter: any = {
      $or: [
        {
          sender: userId,
          ...(counterpartyId && { receiver: counterpartyId }),
          ...(onlyNew && { seen: false }),
        },
        {
          receiver: userId,
          ...(counterpartyId && { sender: counterpartyId }),
          ...(onlyNew && { seen: false }),
        },
      ],
    };

    const res = await this.messagesRepo.getMany(filter, {
      sort: { createdAt: 'asc' },
    });

    return {
      messages: res.map((r) => ({
        _id: (r as any)._id.toString(),
        sender: r.sender,
        receiver: r.receiver,
        text: r.text,
        seen: r.seen,
        createdAt: r.createdAt,
      })),
    };
  }

  async markMessagesSeen(userId: string, messageIds: string[]): Promise<void> {
    await this.messagesRepo.updateMany(
      { _id: { $in: messageIds }, receiver: userId },
      { seen: true },
    );
  }
}
