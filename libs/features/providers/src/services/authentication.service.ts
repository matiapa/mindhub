import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ProviderEnum } from '../enums/providers.enum';
import { TokensRepository } from '../repositories/tokens.repository';
import { SpotifyAuthService } from '@Provider/spotify-sdk';
import { SyncRequest } from '../entities/sync-request.entity';
import { SynchronizationService } from './synchronization.service';
import { ProvidersConfig } from '../providers.config';
import { ConfigService } from '@nestjs/config';
import { RedeemCodeRes } from '@Provider/spotify-sdk/spotify-auth.service';

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

  public getLoginUrl(forUserId: string, provider: ProviderEnum): string {
    let url;

    if (provider === ProviderEnum.SPOTIFY) {
      url = this.spotifyAuthService.getLoginUrl(forUserId);
    } else {
      throw Error('Unkown provider');
    }

    return url;
  }

  public async redeemCode(
    provider: ProviderEnum,
    ofUserId: string,
    state: string,
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

    // If user id does not match state reject the request

    if (state != ofUserId) {
      throw new UnauthorizedException('Bad state');
    }

    // Redeem the code using provider specific strategy

    let res: RedeemCodeRes;
    if (provider === ProviderEnum.SPOTIFY) {
      res = await this.spotifyAuthService.redeemAuthCode(code!);
    } else {
      throw new BadRequestException('Unkown provider');
    }

    // Store the refresh token and scopes

    await this.tokensRepo.update(ofUserId, provider, {
      refreshToken: res.refreshToken,
      scopes: res.scopes,
    });

    // Queue a synchronization request

    const message: SyncRequest = {
      userId: ofUserId,
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
