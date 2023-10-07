import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { SpotifyConfig } from './spotify.config';
import { ConfigService } from '@nestjs/config';
import { ProviderAuthService } from '@Feature/providers/types/provider.interface';
import { Token } from '@Feature/providers/entities/tokens.entity';
import { ProviderEnum } from '@Feature/providers';

@Injectable()
export class SpotifyAuthService implements ProviderAuthService {
  public providerName: ProviderEnum = ProviderEnum.SPOTIFY;

  private config: SpotifyConfig;

  constructor(configService: ConfigService) {
    this.config = configService.get<SpotifyConfig>('spotify')!;
  }

  getLoginUrl(forUserId: string): string {
    const scope = this.config.requestedScopes;

    return (
      'https://accounts.spotify.com/authorize?' +
      new URLSearchParams({
        response_type: 'code',
        client_id: this.config.clientId,
        redirect_uri: this.config.authCodeRedeemUrl,
        state: forUserId,
        scope: scope,
      }).toString()
    );
  }

  async redeemAuthCode(ofUserId: string, code: string): Promise<Token> {
    const clientAuthToken = Buffer.from(
      this.config.clientId + ':' + this.config.clientSecret,
    ).toString('base64');

    const res = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: new URLSearchParams({
        code: code!,
        redirect_uri: this.config.authCodeRedeemUrl,
        grant_type: 'authorization_code',
      }).toString(),
      headers: {
        Authorization: 'Basic ' + clientAuthToken,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return {
      userId: ofUserId,
      service: ProviderEnum.SPOTIFY,
      refreshToken: res.data['refresh_token'],
      scopes: res.data['scope'],
    };
  }
}
