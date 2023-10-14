import { Module } from '@nestjs/common';
import { FriendshipsService } from './friendships.service';
import { FriendshipsRepository } from './friendships.repository';
import { MailingModule } from 'libs/providers/mailing/src/mailing.module';
import { UsersModule } from 'libs/features/users/src';
import { Friendship, FriendshipSchema } from './entities';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Friendship.name, schema: FriendshipSchema },
    ]),
    UsersModule,
    MailingModule,
  ],
  providers: [FriendshipsService, FriendshipsRepository],
  exports: [FriendshipsService],
})
export class FriendshipsModule {}
