import { Injectable } from '@nestjs/common';
import axios from 'axios';
import queryString from 'query-string';
import { getAuthenticadedUserId } from 'apps/users/src/utils';
import { ResourceProviderEnum } from '../../features/resources/enums';
import { TokensRepository } from '../../features/tokens';

@Injectable()
export class SpotifyAuthService {
  constructor(private readonly tokensRepo: TokensRepository) {}

  getLoginUrl(): string {
    const scope = process.env.SPOTIFY_REQUESTED_SCOPES;

    return (
      'https://accounts.spotify.com/authorize?' +
      queryString.stringify({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        state: getAuthenticadedUserId(),
        redirect_uri: process.env.SPOTIFY_CODE_REDIRECT_URI,
      })
    );
  }

  async redeemAuthCode(
    userId: string,
    code?: string,
    error?: string,
  ): Promise<string> {
    if (!code && error) {
      return (
        process.env.SPOTIFY_FINAL_REDIRECT_URI +
        queryString.stringify({
          status: 'failed',
          reason: error,
        })
      );
    }

    const clientAuthToken = Buffer.from(
      process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET,
    ).toString('base64');

    const res = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: queryString.stringify({
        code: code,
        redirect_uri: process.env.SPOTIFY_CODE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
      headers: {
        Authorization: 'Basic ' + clientAuthToken,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    await this.tokensRepo.update(userId, ResourceProviderEnum.SPOTIFY, {
      refreshToken: res.data['refresh_token'],
      scopes: res.data['scope'],
    });

    return (
      process.env.SPOTIFY_FINAL_REDIRECT_URI +
      queryString.stringify({
        status: 'success',
      })
    );
  }
}
