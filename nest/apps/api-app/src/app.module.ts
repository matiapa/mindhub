import { Module } from '@nestjs/common';
import { ApiProvidersModule } from './providers/providers.module';
import { ApiInterestsModule } from './interests/interests.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from './app.config';
import { ApiUsersModule } from './users/users.module';
import { ApiFriendshipsModule } from './friendships/friendships.module';
import { ApiRecommendationsModule } from './recommendations/recommendations.module';
import { ApiTextsModule } from './texts/texts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { createMongooseOptions } from '@Provider/mongodb/mongoose-config';
import { HealthModule } from 'libs/features/healthcheck/health.module';
import { ApiRatesModule } from './rates/rates.module';
import { ApiMessagesModule } from './messages/messages.module';
import { ApiNotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
      envFilePath: [
        '.env',
        'envs/.env.default',
        `envs/.env.${process.env.NODE_ENV ?? 'local'}`,
      ],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>
        createMongooseOptions(configService.get('mongo')),
      inject: [ConfigService],
    }),
    ApiUsersModule,
    ApiFriendshipsModule,
    ApiRecommendationsModule,
    ApiInterestsModule,
    ApiTextsModule,
    ApiProvidersModule,
    ApiRatesModule,
    ApiMessagesModule,
    ApiNotificationsModule,
    HealthModule,
  ],
})
export class AppModule {}
