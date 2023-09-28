import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ConsumersAppModule } from './consumers-app.module';
import { QueueService } from '@Provider/queue';
import { SynchronizationService } from '@Feature/providers';

async function bootstrap() {
  const app = await NestFactory.create(ConsumersAppModule);

  const queueService = app.get<QueueService>(QueueService);

  const syncService = app.get<SynchronizationService>(SynchronizationService);

  queueService.registerHandler(
    process.env.PROVIDER_SYNC_QUEUE_URL!,
    syncService.handleRequest,
  );

  await app.listen(3001);
}
bootstrap();
