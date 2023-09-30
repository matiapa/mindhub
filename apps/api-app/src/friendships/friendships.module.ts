import { Module } from '@nestjs/common';
import { FriendshipsModule } from '@Feature/friendships';
import { FriendshipsController } from './friendships.controller';
import { AuthenticationModule } from '@Provider/authentication';

@Module({
  imports: [FriendshipsModule, AuthenticationModule],
  controllers: [FriendshipsController],
})
export class ApiFriendshipsModule {}
