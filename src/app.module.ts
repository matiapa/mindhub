import { Module } from '@nestjs/common';
import { UsersModule } from './features/users';
import { FriendshipsModule } from './features/friendships';
import { AuthenticationModule } from './apps/authentication/authentication.module';
import { ExtractionModule } from './apps/extraction/extraction.module';

@Module({
  imports: [
    UsersModule,
    FriendshipsModule,
    AuthenticationModule,
    ExtractionModule,
  ],
})
export class AppModule {}
