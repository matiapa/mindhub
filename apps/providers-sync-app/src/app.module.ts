import { ProvidersModule } from '@Feature/providers';
import { QueueModule } from '@Provider/queue';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from './app.config';
import { ProvidersSyncController } from './controllers/sync-handler.consumer';
import { MongooseModule } from '@nestjs/mongoose';
import { createMongooseOptions } from '@Provider/mongodb/mongoose-config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>
        createMongooseOptions(configService.get('mongo')),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
      envFilePath: ['.env', 'envs/.env.default'],
    }),
    QueueModule,
    ProvidersModule,
  ],
  controllers: [ProvidersSyncController],
})
export class AppModule {}
