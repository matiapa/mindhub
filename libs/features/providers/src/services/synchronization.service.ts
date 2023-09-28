import { Injectable, Logger } from '@nestjs/common';
import { TokensRepository } from '../repositories/tokens.repository';
import { ProviderEnum } from '../enums/providers.enum';
import { InterestsService, Interest } from '@Feature/interests';
import { ResourcesService, Resource } from '@Feature/resources';
import { SpotifyEtlService } from '@Provider/spotify-sdk';
import { SyncRequest } from '../entities/sync-request.entity';

@Injectable()
export class SynchronizationService {
  constructor(
    private readonly spotifyEtlService: SpotifyEtlService,
    private readonly tokensRepo: TokensRepository,
    private readonly resourcesService: ResourcesService,
    private readonly interestsService: InterestsService,
  ) {}

  private readonly logger = new Logger(SynchronizationService.name);

  // We use lambda syntax for keeping the context

  handleRequest = async (request: SyncRequest): Promise<void> => {
    this.logger.log(`Synchronization started`, request);

    let resources: Partial<Resource>[];

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

    const interests: Partial<Interest>[] = resources.map((r) => ({
      userId: request.userId,
      resourceId: r.resourceId,
    }));

    await this.interestsService.createMany(interests);

    this.logger.log(
      `Synchronization finished: ${resources.length} resources extracted`,
    );
  };
}
