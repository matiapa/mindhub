import { QueueService } from '@Provider/queue';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SyncRequest } from '../entities/sync-request.entity';
import { ProvidersConfig } from '../providers.config';

@Injectable()
export class ProvidersSyncRequestService {
  private readonly logger = new Logger(ProvidersSyncRequestService.name);
  private config: ProvidersConfig;

  constructor(
    private readonly queueService: QueueService,
    private readonly configService: ConfigService,
  ) {
    this.config = this.configService.get<ProvidersConfig>('providers')!;
  }

  public postRequest(request: SyncRequest): Promise<string> {
    return this.queueService.sendMessage(
      this.config.sync.requestsQueueUrl,
      request,
    );
  }
}
