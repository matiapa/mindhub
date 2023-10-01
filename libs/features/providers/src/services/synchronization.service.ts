import { Injectable, Logger } from '@nestjs/common';
import { TokensRepository } from '../repositories/tokens.repository';
import { ProviderEnum } from '../enums/providers.enum';
import { InterestsService, Interest } from '@Feature/interests';
import { ResourcesService, Resource } from '@Feature/resources';
import { SpotifyEtlService } from '@Provider/spotify-sdk';
import { SyncRequest } from '../entities/sync-request.entity';
import { QueueService } from '@Provider/queue';
import { ConfigService } from '@nestjs/config';
import { ProvidersConfig } from '../providers.config';
import { InterestRelevance } from '@Feature/interests/interest.entity';

@Injectable()
export class SynchronizationService {
  private readonly logger = new Logger(SynchronizationService.name);
  private config: ProvidersConfig;

  constructor(
    private readonly spotifyEtlService: SpotifyEtlService,
    private readonly tokensRepo: TokensRepository,
    private readonly resourcesService: ResourcesService,
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

    let resources: Resource[];

    // Get the refresh token of the user

    const token = await this.tokensRepo.getOne(
      request.userId,
      request.provider,
    );

    // Get the resources in which the user is interested using provider specific strategy

    if (request.provider === ProviderEnum.SPOTIFY) {
      resources = await this.spotifyEtlService.getResources(token.refreshToken);
    } else {
      throw Error('Unknown provider');
    }

    // Store the resources without user data for future reference

    await this.resourcesService.createMany(resources);

    // Create interest relations between the user and the resources

    // TODO: Providers should return interest relevance

    const interests: Interest[] = resources.map((r) => ({
      userId: request.userId,
      resourceId: r.resourceId,
      relevance: InterestRelevance.NORMAL,
    }));

    await this.interestsService.createMany(interests);

    this.logger.log(
      `Synchronization finished: ${resources.length} resources extracted`,
    );
  };
}
