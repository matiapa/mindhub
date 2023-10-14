import { QueueService } from '@Provider/queue';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SyncRequestDto } from '../dtos/sync-request.dto';
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

  public postRequest(request: SyncRequestDto): Promise<string> {
    return this.queueService.sendMessage(
      this.config.sync.requestsQueueUrl,
      request,
    );
  }
}
