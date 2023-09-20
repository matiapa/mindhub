import { Module } from '@nestjs/common';
import { UsersModule } from './features/users';
import { FriendshipsModule } from './features/friendships';

@Module({
  imports: [UsersModule, FriendshipsModule],
})
export class AppModule {}
