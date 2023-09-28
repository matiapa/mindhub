import { Injectable } from '@nestjs/common';
import { ProviderEnum } from '../../resources/enums';
import { SpotifyAuthService } from 'src/providers';
import { TokensRepository } from '../repositories/tokens.repository';
import { SyncRequestService } from 'src/providers/sync-request';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly spotifyAuthService: SpotifyAuthService,
    private readonly tokensRepo: TokensRepository,
    private readonly syncRequestService: SyncRequestService,
  ) {}

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
        url: process.env.CODE_REDEEM_REDIRECT_URI,
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

    await this.syncRequestService.createRequest({
      userId,
      provider,
      requester: 'authentication service',
    });

    // Return the result with redirect uri

    return {
      url: process.env.CODE_REDEEM_REDIRECT_URI!,
      status: 'success',
    };
  }
}
