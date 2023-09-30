import { Injectable, Logger } from '@nestjs/common';
import { ProviderEnum } from '../enums/providers.enum';
import { TokensRepository } from '../repositories/tokens.repository';
import { SpotifyAuthService } from '@Provider/spotify-sdk';
import { SyncRequest } from '../entities/sync-request.entity';
import { SynchronizationService } from './synchronization.service';
import { ProvidersConfig } from '../providers.config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  private config: ProvidersConfig;

  constructor(
    private readonly tokensRepo: TokensRepository,
    private readonly spotifyAuthService: SpotifyAuthService,
    private readonly synchronizationService: SynchronizationService,
    private readonly configService: ConfigService,
  ) {
    this.config = configService.get<ProvidersConfig>('providers')!;
  }

  public getLoginUrl(provider: ProviderEnum): string {
    let url;

    if (provider === ProviderEnum.SPOTIFY) {
      url = this.spotifyAuthService.getLoginUrl();
    } else {
      throw Error('Unkown provider');
    }

    return url;
  }

  public async redeemCode(
    provider: ProviderEnum,
    userId: string,
    code?: string,
    error?: string,
  ) {
    if (!code && error) {
      return {
        url: this.config.codeRedeemRedirectUrl,
        status: 'failed',
        reason: error,
      };
    }

    // Redeem the code using provider specific strategy

    let res;
    if (provider === ProviderEnum.SPOTIFY) {
      res = this.spotifyAuthService.redeemAuthCode(userId, code!);
    } else {
      throw Error('Unkown provider');
    }

    // Store the refresh token and scopes

    await this.tokensRepo.update(userId, provider, {
      refreshToken: res.data['refresh_token'],
      scopes: res.data['scope'],
    });

    // Queue a synchronization request

    const message: SyncRequest = {
      userId,
      provider,
      requester: 'authentication service',
    };

    const messageId = await this.synchronizationService.postRequest(message);

    this.logger.log(`Synchronization requested: MessageID=${messageId}`);

    // Return the result with redirect uri

    return {
      url: this.config.codeRedeemRedirectUrl,
      status: 'success',
    };
  }
}
