import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { QueueService } from '@Provider/queue';
import { ConfigService } from '@nestjs/config';
import { ProvidersConfig } from '@Feature/providers/providers.config';
import { ProvidersFileService } from '@Feature/providers/services/files.service';
import { ProvidersSyncHandlerService } from '@Feature/providers';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const queueService = app.get<QueueService>(QueueService);
  const configService = app.get<ConfigService>(ConfigService);
  const config = configService.get<ProvidersConfig>('providers')!;

  const syncService = app.get<ProvidersSyncHandlerService>(
    ProvidersSyncHandlerService,
  );
  queueService.registerHandler(
    config.sync.requestsQueueUrl,
    syncService.handleRequest,
  );

  const fileService = app.get<ProvidersFileService>(ProvidersFileService);
  queueService.registerHandler(
    config.file.uploadedQueueUrl,
    fileService.handleFileUploaded,
  );

  await app.listen(3001);
}
bootstrap();
