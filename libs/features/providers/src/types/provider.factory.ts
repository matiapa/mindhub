import { Injectable } from '@nestjs/common';
import { ProviderEnum } from '../enums/providers.enum';
import { SpotifyAuthService, SpotifySyncService } from '@Provider/spotify';
import { TwitterSyncService } from '@Provider/twitter';
import { ProviderAuthService, ProviderSyncService } from './provider.interface';

@Injectable()
export class ProviderServices {
  constructor(
    private readonly spotifyAuthService: SpotifyAuthService,
    private readonly twitterSyncService: TwitterSyncService,
    private readonly spotifySyncService: SpotifySyncService,
  ) {}

  getAuthService(provider: ProviderEnum): ProviderAuthService | null {
    switch (provider) {
      case ProviderEnum.SPOTIFY:
        return this.spotifyAuthService;
      case ProviderEnum.TWITTER:
      case ProviderEnum.USER:
        return null;
      default:
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _exhaustiveCheck: never = provider;
        return null;
    }
  }

  getSyncService(provider: ProviderEnum): ProviderSyncService | null {
    switch (provider) {
      case ProviderEnum.SPOTIFY:
        return this.spotifySyncService;
      case ProviderEnum.TWITTER:
        return this.twitterSyncService;
      case ProviderEnum.USER:
        return null;
      default:
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _exhaustiveCheck: never = provider;
        return null;
    }
  }
}
