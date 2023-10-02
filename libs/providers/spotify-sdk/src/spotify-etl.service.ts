import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ProviderEnum } from '@Feature/providers';
import { ConfigService } from '@nestjs/config';
import { SpotifySdkConfig } from './spotify-sdk.config';
import { Interest } from '@Feature/interests';
import { InterestRelevance } from '@Feature/interests/entities/interest.entity';
import { ResourceType } from '@Feature/interests/enums/resource-type.enum';

@Injectable()
export class SpotifyEtlService {
  private accessToken: string;
  private scopes: string[];

  private readonly logger = new Logger(SpotifyEtlService.name);

  private config: SpotifySdkConfig;

  constructor(configService: ConfigService) {
    this.config = configService.get<SpotifySdkConfig>('spotify')!;
  }

  private _request(url: string) {
    return axios.get(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
  }

  private async _initialize(refreshToken: string) {
    const clientAuthToken = Buffer.from(
      this.config.clientId + ':' + this.config.clientSecret,
    ).toString('base64');

    const res = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: new URLSearchParams({
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
      headers: {
        Authorization: 'Basic ' + clientAuthToken,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    this.accessToken = res.data['access_token'];
    this.scopes = res.data['scope'].split(' ');
  }

  private async _getTopTracks(userId: string): Promise<Interest[]> {
    if (!this.scopes.includes('user-top-read')) {
      return [];
    }

    let nextPageUrl = 'https://api.spotify.com/v1/me/top/tracks';
    const maxTracks = 20;

    const tracks: Interest[] = [];

    while (nextPageUrl && tracks.length < maxTracks) {
      const res = await this._request(nextPageUrl);

      for (const track of res.data['items']) {
        try {
          tracks.push({
            userId,
            provider: ProviderEnum.SPOTIFY,
            relevance: InterestRelevance.NORMAL,
            resourceId: track['id'],
            resource: {
              name: track['name'],
              type: ResourceType.TRACK,
            },
          });
        } catch (error) {
          this.logger.error('Parsing Spotify top track', error);
          continue;
        }
      }

      nextPageUrl = res.data['next'];
    }

    return tracks;
  }

  private async _getTopArtists(userId: string): Promise<Interest[]> {
    if (!this.scopes.includes('user-top-read')) {
      return [];
    }

    let nextPageUrl = 'https://api.spotify.com/v1/me/top/artists';
    const maxArtists = 20;

    const artists: Interest[] = [];

    while (nextPageUrl && artists.length < maxArtists) {
      const res = await this._request(nextPageUrl);

      for (const artist of res.data['items']) {
        try {
          artists.push({
            userId,
            provider: ProviderEnum.SPOTIFY,
            relevance: InterestRelevance.NORMAL,
            resourceId: artist['id'],
            resource: {
              name: artist['name'],
              type: ResourceType.TRACK,
            },
          });
        } catch (error) {
          this.logger.error('Parsing Spotify top artist', error);
          continue;
        }
      }

      nextPageUrl = res.data['next'];
    }

    return artists;
  }

  async getInterests(
    userId: string,
    userRefreshToken: string,
  ): Promise<Interest[]> {
    await this._initialize(userRefreshToken);

    const tracks = await this._getTopTracks(userId);
    const artists = await this._getTopArtists(userId);

    return [...tracks, ...artists];
  }
}
