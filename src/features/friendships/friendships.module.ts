import { Module } from '@nestjs/common';
import { FriendshipsService } from './friendships.service';
import { FriendshipsController } from './friendships.controller';
import { FriendshipsRepository } from './friendships.repository';
import { UsersModule } from '../users';
import { MailingModule } from 'src/providers/mailing/mailing.module';

@Module({
  imports: [UsersModule, MailingModule],
  controllers: [FriendshipsController],
  providers: [FriendshipsService, FriendshipsRepository],
})
export class FriendshipsModule {}
