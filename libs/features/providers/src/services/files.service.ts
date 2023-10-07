import { Injectable, Logger } from '@nestjs/common';
import { ProviderEnum } from '../enums/providers.enum';
import { ProvidersConfig } from '../providers.config';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '@Provider/storage';
import { SyncSource } from '../entities/sync-request.entity';
import { Readable } from 'stream';
import { ProvidersSyncRequestService } from './sync-request.service';

@Injectable()
export class ProvidersFileService {
  private readonly logger = new Logger(ProvidersFileService.name);

  private config: ProvidersConfig;

  constructor(
    private readonly storageService: StorageService,
    private readonly syncRequestService: ProvidersSyncRequestService,
    configService: ConfigService,
  ) {
    this.config = configService.get<ProvidersConfig>('providers')!;
  }

  private key = (provider, userId) => `${provider}/${userId}.zip`;

  public getUploadUrl(
    forUserId: string,
    provider: ProviderEnum,
  ): Promise<string> {
    return this.storageService.getUploadUrl(
      this.config.file.bucket,
      this.key(provider, forUserId),
      Number(this.config.file.uploadUrlTtl),
      'application/zip',
    );
  }

  handleFileUploaded = async (eventMessage: any) => {
    // We use lambda syntax for keeping the context

    const event = this.storageService.parseStorageEvent(eventMessage);
    if (!event) {
      this.logger.warn('Received an invalid message', eventMessage);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, provider, userId] =
      event.key.match(/^([^/]+)\/([^/]+)\.zip$/) || [];

    await this.syncRequestService.postRequest({
      userId,
      provider: provider as ProviderEnum,
      requester: 'file upload service',
      source: SyncSource.FILE,
    });
  };

  public getDownloadStream(
    forUserId: string,
    provider: ProviderEnum,
  ): Promise<Readable> {
    return this.storageService.getDownloadStream(
      this.config.file.bucket,
      this.key(provider, forUserId),
    );
  }
}
