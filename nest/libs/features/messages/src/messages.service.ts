import { BadRequestException, Injectable } from '@nestjs/common';
import { MessagesRepository } from './messages.repository';
import { GetMessagesResDto } from './dtos/get-given-messages.dto';

@Injectable()
export class MessagesService {
  constructor(private readonly messagesRepo: MessagesRepository) {}

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
