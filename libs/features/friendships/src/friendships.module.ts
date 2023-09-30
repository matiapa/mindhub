import { Module } from '@nestjs/common';
import { FriendshipsService } from './friendships.service';
import { FriendshipsRepository } from './friendships.repository';
import { MailingModule } from 'libs/providers/mailing/src/mailing.module';
import { UsersModule } from 'libs/features/users/src';

@Module({
  imports: [UsersModule, MailingModule],
  providers: [FriendshipsService, FriendshipsRepository],
  exports: [FriendshipsService],
})
export class FriendshipsModule {}
