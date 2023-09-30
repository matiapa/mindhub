import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { SpotifySdkConfig } from './spotify-sdk.config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SpotifyAuthService {
  private config: SpotifySdkConfig;

  constructor(configService: ConfigService) {
    this.config = configService.get<SpotifySdkConfig>('spotify')!;
  }

  getLoginUrl(): string {
    const scope = this.config.requestedScopes;

    return (
      'https://accounts.spotify.com/authorize?' +
      new URLSearchParams({
        response_type: 'code',
        client_id: this.config.clientId,
        scope: scope,
        redirect_uri: this.config.authCodeRedeemUrl,
      }).toString()
    );
  }

  async redeemAuthCode(userId: string, code: string) {
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
      refreshToken: res.data['refresh_token'],
      scopes: res.data['scope'],
    };
  }
}
