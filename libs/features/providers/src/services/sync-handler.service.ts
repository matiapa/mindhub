import { InterestsService } from '@Feature/interests';
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SyncRequest, SyncSource } from '../entities/sync-request.entity';
import { SyncResult } from '../entities/sync-result.entity';
import { ProvidersConfig } from '../providers.config';
import { ProviderSyncService } from '../types/provider.interface';
import { ProvidersFileService } from './files.service';
import { ProvidersAuthService } from './auth.service';
import { streamToBuffer } from 'libs/utils/streams';
import { TextsService } from '@Feature/texts';
import { ProviderServices } from '../types/provider.factory';

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

  handleRequest = async (request: SyncRequest): Promise<void> => {
    // We use lambda syntax for keeping the context

    this.logger.log(`Synchronization started`, request);

    const provider = this.providersServices.getSyncService(request.provider);

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
        throw new BadRequestException('Invalid source');
    }

    if (result.interests) {
      await this.interestsService.createMany(result.interests);
    }

    await this.textsService.createMany(result.texts);

    this.logger.log(
      `Synchronization finished: ${result.interests?.length} interests loaded`,
    );
  };

  private async syncFromFile(
    userId: string,
    provider: ProviderSyncService,
  ): Promise<SyncResult> {
    const fileStream = await this.fileService.getDownloadStream(
      userId,
      provider.providerName,
    );

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

    return provider.syncFromApi(userId, refreshToken);
  }
}
