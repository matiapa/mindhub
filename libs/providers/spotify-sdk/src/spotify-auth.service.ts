import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SpotifyAuthService {
  getLoginUrl(): string {
    const scope = process.env.SPOTIFY_REQUESTED_SCOPES!;

    return (
      'https://accounts.spotify.com/authorize?' +
      new URLSearchParams({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        scope: scope,
        redirect_uri: process.env.SPOTIFY_AUTH_CODE_REDEEM_URI!,
      }).toString()
    );
  }

  async redeemAuthCode(userId: string, code: string) {
    const clientAuthToken = Buffer.from(
      process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET,
    ).toString('base64');

    const res = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: new URLSearchParams({
        code: code!,
        redirect_uri: process.env.SPOTIFY_AUTH_CODE_REDEEM_URI!,
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
