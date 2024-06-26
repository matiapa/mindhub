import { Injectable, Logger } from '@nestjs/common';
import { ProviderEnum } from '../enums/providers.enum';
import { ProvidersConfig } from '../providers.config';
import { ConfigService } from '@nestjs/config';
import { ProviderServices } from '../types/provider.factory';
import { ProvidersSyncRequestService } from './sync-request.service';
import { ProvidersConnRepository } from '../repositories/connection.repository';
import { SyncSource } from '../enums/sync-source.enum';

@Injectable()
export class ProvidersAuthService {
  private readonly logger = new Logger(ProvidersAuthService.name);

  private config: ProvidersConfig;

  constructor(
    private readonly connRepo: ProvidersConnRepository,
    private readonly providerServices: ProviderServices,
    private readonly syncRequestService: ProvidersSyncRequestService,
    configService: ConfigService,
  ) {
    this.config = configService.get<ProvidersConfig>('providers')!;
  }

  public getLoginUrl(state: string, providerName: ProviderEnum): string {
    const provider = this.providerServices.getAuthService(providerName);

    return provider.getLoginUrl(state);
  }

  public async redeemCode(
    providerName: ProviderEnum,
    userId: string,
    code?: string,
    error?: string,
  ) {
    if (!code) {
      return {
        status: 'failed',
        reason: error,
      };
    }

    // Redeem the auth code for a token

    const provider = this.providerServices.getAuthService(providerName);

    const res = await provider.redeemAuthCode(code);

    // Store the refresh token and scopes

    await this.connRepo.updateOne(
      { userId, provider: providerName },
      {
        oauth: {
          refreshToken: res.refreshToken,
          scopes: res.scopes,
          date: new Date(),
        },
      },
      { upsert: true },
    );

    // Queue a synchronization request

    const messageId = await this.syncRequestService.postRequest({
      userId,
      provider: providerName,
      source: SyncSource.API,
      requester: 'authentication service',
    });

    this.logger.log(`Synchronization requested: MessageID=${messageId}`);

    // Return the result with redirect uri

    return {
      status: 'success',
    };
  }

  public async getRefreshToken(
    forUserId: string,
    provider: ProviderEnum,
  ): Promise<string | null> {
    const conn = await this.connRepo.getOne({ userId: forUserId, provider });
    if (!conn || !conn.oauth) {
      return null;
    }
    return conn.oauth.refreshToken;
  }
}
