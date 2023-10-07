import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ProviderEnum } from '../enums/providers.enum';
import { TokensRepository } from '../repositories/tokens.repository';
import { SyncRequest, SyncSource } from '../entities/sync-request.entity';
import { ProvidersConfig } from '../providers.config';
import { ConfigService } from '@nestjs/config';
import { ProviderServices } from '../types/provider.factory';
import { ProvidersSyncRequestService } from './sync-request.service';

@Injectable()
export class ProvidersAuthService {
  private readonly logger = new Logger(ProvidersAuthService.name);

  private config: ProvidersConfig;

  constructor(
    private readonly tokensRepo: TokensRepository,
    private readonly providerServices: ProviderServices,
    private readonly syncRequestService: ProvidersSyncRequestService,
    configService: ConfigService,
  ) {
    this.config = configService.get<ProvidersConfig>('providers')!;
  }

  public getLoginUrl(forUserId: string, providerName: ProviderEnum): string {
    const provider = this.providerServices.getAuthService(providerName);

    return provider.getLoginUrl(forUserId);
  }

  public async redeemCode(
    providerName: ProviderEnum,
    ofUserId: string,
    state: string,
    code?: string,
    error?: string,
  ) {
    if (!code && error) {
      return {
        url: this.config.api.codeRedeemRedirectUrl,
        status: 'failed',
        reason: error,
      };
    }

    // If user id does not match state reject the request

    if (state != ofUserId) {
      throw new UnauthorizedException('Bad state');
    }

    // Redeem the auth code for a token

    const provider = this.providerServices.getAuthService(providerName);

    const res = await provider.redeemAuthCode(ofUserId, code!);

    // Store the refresh token and scopes

    await this.tokensRepo.update(ofUserId, providerName, {
      refreshToken: res.refreshToken,
      scopes: res.scopes,
    });

    // Queue a synchronization request

    const message: SyncRequest = {
      userId: ofUserId,
      provider: providerName,
      source: SyncSource.API,
      requester: 'authentication service',
    };

    const messageId = await this.syncRequestService.postRequest(message);

    this.logger.log(`Synchronization requested: MessageID=${messageId}`);

    // Return the result with redirect uri

    return {
      url: this.config.api.codeRedeemRedirectUrl,
      status: 'success',
    };
  }

  public async getRefreshToken(
    forUserId: string,
    provider: ProviderEnum,
  ): Promise<string> {
    const token = await this.tokensRepo.getOne(forUserId, provider);
    return token.refreshToken;
  }
}
