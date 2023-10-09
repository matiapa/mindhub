import {
  ProvidersConfig,
  ProvidersSyncHandlerService,
} from '@Feature/providers';
import { QueueService } from '@Provider/queue';
import { Controller, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { SyncRequest } from '@Feature/providers/entities/sync-request.entity';
import { validate } from 'class-validator';

@Controller()
export class ProvidersSyncController {
  private readonly logger = new Logger(ProvidersSyncController.name);
  private config: ProvidersConfig;

  constructor(
    private readonly syncService: ProvidersSyncHandlerService,
    private readonly queueService: QueueService,
    readonly configService: ConfigService,
  ) {
    this.config = configService.get<ProvidersConfig>('providers');
    this._initialize();
  }

  private _initialize() {
    this.queueService.registerHandler(
      this.config.sync.requestsQueueUrl,
      this.handleRequest,
    );
  }

  handleRequest = async (eventMessage: any) => {
    const request = plainToInstance(SyncRequest, eventMessage);

    const err = await validate(request);
    if (err.length) {
      this.logger.error('Invalid request', err);
      return;
    }

    await this.syncService.handleRequest(request);
  };
}
