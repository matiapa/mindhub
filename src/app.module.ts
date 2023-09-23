import { Module } from '@nestjs/common';
import { UsersModule } from './features/users';
import { FriendshipsModule } from './features/friendships';
import { AuthenticationModule } from './layers/authentication/authentication.module';
import { ExtractionModule } from './layers/extraction/extraction.module';

@Module({
  imports: [
    UsersModule,
    FriendshipsModule,
    AuthenticationModule,
    ExtractionModule,
  ],
})
export class AppModule {}
