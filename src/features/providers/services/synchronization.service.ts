import { Injectable } from '@nestjs/common';
import { Interest, InterestsService } from 'src/features/interests';
import { Resource, ResourcesService } from 'src/features/resources';
import { ProviderEnum } from 'src/features/resources/enums';
import { SpotifyEtlService } from 'src/providers';
import { SyncRequestService } from 'src/providers/sync-request';
import { SyncRequestMessage } from 'src/providers/sync-request/sync-request.service';
import { TokensRepository } from '../repositories/tokens.repository';

@Injectable()
export class SynchronizationService {
  constructor(
    private readonly spotifyEtlService: SpotifyEtlService,
    private readonly syncRequestService: SyncRequestService,
    private readonly tokensRepo: TokensRepository,
    private readonly resourcesService: ResourcesService,
    private readonly interestsService: InterestsService,
  ) {
    this.syncRequestService.registerHandler(this.handleRequest);
  }

  async handleRequest(request: SyncRequestMessage): Promise<void> {
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
  }
}
