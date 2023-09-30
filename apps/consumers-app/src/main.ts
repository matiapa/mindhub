import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { QueueService } from '@Provider/queue';
import { SynchronizationService } from '@Feature/providers';
import { ConfigService } from '@nestjs/config';
import { ProvidersConfig } from '@Feature/providers/providers.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const queueService = app.get<QueueService>(QueueService);

  const syncService = app.get<SynchronizationService>(SynchronizationService);

  const configService = app.get<ConfigService>(ConfigService);
  const config = configService.get<ProvidersConfig>('providers')!;

  queueService.registerHandler(
    config.syncRequestsQueueUrl,
    syncService.handleRequest,
  );

  await app.listen(3001);
}
bootstrap();
