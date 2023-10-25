import { Module } from '@nestjs/common';
import { FriendshipsModule } from '@Feature/friendships';
import { FriendshipsController } from './friendships.controller';

@Module({
  imports: [FriendshipsModule],
  controllers: [FriendshipsController],
})
export class ApiFriendshipsModule {}
