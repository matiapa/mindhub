import { BadRequestException, Injectable } from '@nestjs/common';
import { MessagesRepository } from './messages.repository';
import { GetMessagesResDto } from './dtos/get-given-messages.dto';
import { NotificationsService } from '@Feature/notifications';
import { NotificationType } from '@Feature/notifications/entities/notification.entity';
import { UsersService } from '@Feature/users';

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

    await this.messagesRepo.create({
      sender: senderId,
      receiver: receiverId,
      text,
    });

    // Notify the receiver about the acceptance of the request

    const senderUser = await this.usersService.getUserEntity(senderId);
    await this.notificationsService.createNotification({
      targetUserId: receiverId,
      type: NotificationType.NEW_MESSAGE,
      payload: {
        senderName: senderUser?.profile?.name ?? '',
        message: text,
      },
    });
  }

  async getMessages(
    userId: string,
    counterpartyId: string,
  ): Promise<GetMessagesResDto> {
    const res = await this.messagesRepo.getMany(
      {
        $or: [
          { sender: userId, receiver: counterpartyId },
          { sender: counterpartyId, receiver: userId },
        ],
      },
      null,
      null,
      { sort: { createdAt: 'asc' } },
    );

    return {
      messages: res.map((r) => ({
        isOwn: r.sender === userId,
        createdAt: r.createdAt,
        text: r.text,
      })),
    };
  }
}
