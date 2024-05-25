import { Module } from '@nestjs/common';
import { MessagesModule } from '@Feature/messages';
import { MessagesController } from './messages.controller';

@Module({
  imports: [MessagesModule],
  controllers: [MessagesController],
})
export class ApiMessagesModule {}
