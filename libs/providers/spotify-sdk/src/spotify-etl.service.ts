import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ProviderEnum } from '@Feature/providers';
import { Resource } from '@Feature/resources';
import { ResourceTypeEnum } from '@Feature/resources/enums';

@Injectable()
export class SpotifyEtlService {
  private accessToken: string;
  private scopes: string[];

  private readonly logger = new Logger(SpotifyEtlService.name);

  private _request(url: string) {
    return axios.get(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
  }

  private async _initialize(refreshToken: string) {
    const clientAuthToken = Buffer.from(
      process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET,
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

  private async _getTopTracks(): Promise<Partial<Resource>[]> {
    if (!this.scopes.includes('user-top-read')) {
      return [];
    }

    let nextPageUrl = 'https://api.spotify.com/v1/me/top/tracks';
    const maxTracks = 20;

    const tracks: Partial<Resource>[] = [];

    while (nextPageUrl && tracks.length < maxTracks) {
      const res = await this._request(nextPageUrl);

      for (const track of res.data['items']) {
        try {
          tracks.push({
            resourceId: track['id'],
            provider: ProviderEnum.SPOTIFY,
            type: ResourceTypeEnum.TRACK,
            data: {
              artistId: track['artists'][0]['id'],
              title: track['name'],
              imageUrl: track['album']['images'].length
                ? track['album']['images'][0]['url']
                : undefined,
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

  private async _getTopArtists(): Promise<Partial<Resource>[]> {
    if (!this.scopes.includes('user-top-read')) {
      return [];
    }

    let nextPageUrl = 'https://api.spotify.com/v1/me/top/artists';
    const maxArtists = 20;

    const artists: Partial<Resource>[] = [];

    while (nextPageUrl && artists.length < maxArtists) {
      const res = await this._request(nextPageUrl);

      for (const artist of res.data['items']) {
        try {
          artists.push({
            resourceId: artist['id'],
            provider: ProviderEnum.SPOTIFY,
            type: ResourceTypeEnum.ARTIST,
            data: {
              title: artist['name'],
              imageUrl: artist['images'].length
                ? artist['images'][0]['url']
                : undefined,
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

  async getResources(userRefreshToken: string): Promise<Partial<Resource>[]> {
    await this._initialize(userRefreshToken);

    const tracks = await this._getTopTracks();
    const artists = await this._getTopArtists();

    return [...tracks, ...artists];
  }
}
