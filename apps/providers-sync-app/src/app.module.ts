import { ProvidersModule } from '@Feature/providers';
import { QueueModule } from '@Provider/queue';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './app.config';
import { ProvidersSyncController } from './controllers/sync-handler.consumer';

@Module({
  imports: [
    QueueModule,
    ProvidersModule,
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
      envFilePath: ['.env', 'envs/.env'],
    }),
  ],
  controllers: [ProvidersSyncController],
})
export class AppModule {}
