import { InterestsService } from '@Feature/interests';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SyncRequestDto } from '../dtos/sync-request.dto';
import { ProvidersConfig } from '../providers.config';
import { ProviderSyncService, SyncResult } from '../types/provider.interface';
import { ProvidersFileService } from './files.service';
import { ProvidersAuthService } from './auth.service';
import { streamToBuffer } from 'libs/utils/streams';
import { TextsService } from '@Feature/texts';
import { ProviderServices } from '../types/provider.factory';
import { SyncSource } from '../enums/sync-source.enum';

@Injectable()
export class ProvidersSyncHandlerService {
  private readonly logger = new Logger(ProvidersSyncHandlerService.name);
  private config: ProvidersConfig;

  constructor(
    private readonly interestsService: InterestsService,
    private readonly textsService: TextsService,
    private readonly authService: ProvidersAuthService,
    private readonly fileService: ProvidersFileService,
    private readonly providersServices: ProviderServices,
    private readonly configService: ConfigService,
  ) {
    this.config = this.configService.get<ProvidersConfig>('providers')!;
  }

  public async handleRequest(request: SyncRequestDto): Promise<void> {
    // We use lambda syntax for keeping the context

    this.logger.log(`Synchronization started`, request);

    const provider = this.providersServices.getSyncService(request.provider);
    if (!provider) {
      this.logger.warn('Received an invalid provider', { request });
      return;
    }

    let result: SyncResult;
    switch (request.source) {
      case SyncSource.API:
        result = await this.syncFromApi(request.userId, provider);
        break;
      case SyncSource.FILE:
        // eslint-disable-next-line prettier/prettier
        result = await this.syncFromFile(request.userId, provider);
        break;
      default:
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _exhaustiveCheck: never = request.source;
        this.logger.warn('Received an invalid source', { request });
        return;
    }

    if (!result) {
      return;
    }

    if (result.interests) {
      await this.interestsService.upsertMany(result.interests, request.userId);
    }

    if (result.texts) {
      await this.textsService.upsertMany(result.texts, request.userId);
    }

    this.logger.log('Synchronization finished - Extracted resources', {
      interests: result.interests?.length ?? 0,
      texts: result.texts?.length ?? 0,
    });
  }

  private async syncFromFile(
    userId: string,
    provider: ProviderSyncService,
  ): Promise<SyncResult> {
    const fileStream = await this.fileService.getDownloadStream(
      userId,
      provider.providerName,
    );

    if (!fileStream) {
      this.logger.warn('File not found', {
        userId,
        provider: provider.providerName,
      });
      return;
    }

    const buffer = await streamToBuffer(fileStream);

    return provider.syncFromFile(userId, buffer);
  }

  private async syncFromApi(
    userId: string,
    provider: ProviderSyncService,
  ): Promise<SyncResult> {
    const refreshToken = await this.authService.getRefreshToken(
      userId,
      provider.providerName,
    );

    if (!refreshToken) {
      this.logger.warn('Token not found', {
        userId,
        provider: provider.providerName,
      });
      return;
    }

    return provider.syncFromApi(userId, refreshToken);
  }
}
