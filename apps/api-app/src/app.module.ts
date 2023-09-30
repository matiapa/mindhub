import { Module } from '@nestjs/common';
import { ApiProvidersModule } from './providers/providers.module';
import { ApiInterestsModule } from './interests/interests.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './app.config';
import { ApiUsersModule } from './users/users.module';
import { ApiFriendshipsModule } from './friendships/friendships.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
    }),
    ApiUsersModule,
    ApiFriendshipsModule,
    ApiProvidersModule,
    ApiInterestsModule,
  ],
})
export class AppModule {}
