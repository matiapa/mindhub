import { Injectable, Logger } from '@nestjs/common';
import { TokensRepository } from '../repositories/tokens.repository';
import { ProviderEnum } from '../enums/providers.enum';
import { InterestsService, Interest } from '@Feature/interests';
import { SpotifyEtlService } from '@Provider/spotify-sdk';
import { SyncRequest } from '../entities/sync-request.entity';
import { QueueService } from '@Provider/queue';
import { ConfigService } from '@nestjs/config';
import { ProvidersConfig } from '../providers.config';

@Injectable()
export class SynchronizationService {
  private readonly logger = new Logger(SynchronizationService.name);
  private config: ProvidersConfig;

  constructor(
    private readonly spotifyEtlService: SpotifyEtlService,
    private readonly tokensRepo: TokensRepository,
    private readonly interestsService: InterestsService,
    private readonly queueService: QueueService,
    private readonly configService: ConfigService,
  ) {
    this.config = this.configService.get<ProvidersConfig>('providers')!;
  }

  public postRequest(request: SyncRequest): Promise<string> {
    return this.queueService.sendMessage(
      this.config.syncRequestsQueueUrl,
      request,
    );
  }

  // We use lambda syntax for keeping the context

  handleRequest = async (request: SyncRequest): Promise<void> => {
    this.logger.log(`Synchronization started`, request);

    // Get the refresh token of the user

    const token = await this.tokensRepo.getOne(
      request.userId,
      request.provider,
    );

    // Get the resources in which the user is interested using provider specific strategy

    let interests: Interest[] = [];
    if (request.provider === ProviderEnum.SPOTIFY) {
      interests = await this.spotifyEtlService.getInterests(
        request.userId,
        token.refreshToken,
      );
    } else {
      throw Error('Unknown provider');
    }

    // Create interest relations between the user and the resources

    await this.interestsService.createMany(interests);

    this.logger.log(
      `Synchronization finished: ${interests.length} interests loaded`,
    );
  };
}
