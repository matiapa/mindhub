import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesRepository } from './messages.repository';
import { Message, MessageSchema } from './entities';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsModule } from '@Feature/notifications';
import { UsersModule } from '@Feature/users';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    UsersModule,
    NotificationsModule,
  ],
  providers: [MessagesService, MessagesRepository],
  exports: [MessagesService],
})
export class MessagesModule {}
