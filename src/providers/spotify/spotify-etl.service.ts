import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {
  ResourceProviderEnum,
  ResourceTypeEnum,
} from '../../features/resources/enums';
import queryString from 'query-string';
import { TokensRepository } from '../../features/tokens';
import { ResourcesService } from '../../features/resources/resources.service';
import { InterestsService } from '../../features/interests/interests.service';
import { Resource } from '../../features/resources/entities/resource.entity';
import { Interest } from '../../features/interests/interest.entity';

@Injectable()
export class SpotifyEtlService {
  private accessToken: string;
  private scopes: string[];

  private readonly logger = new Logger(SpotifyEtlService.name);

  constructor(
    private readonly tokensRepo: TokensRepository,
    private readonly resourcesService: ResourcesService,
    private readonly interestsService: InterestsService,
  ) {}

  private _request(url: string) {
    return axios.get(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
  }

  private async _initialize(userId: string) {
    const token = await this.tokensRepo.getOne(
      userId,
      ResourceProviderEnum.SPOTIFY,
    );

    const clientAuthToken = Buffer.from(
      process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET,
    ).toString('base64');

    const res = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: queryString.stringify({
        refresh_token: token.refreshToken,
        grant_type: 'refresh_token',
      }),
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
    const maxTracks = 50;

    const tracks: Partial<Resource>[] = [];

    while (nextPageUrl && tracks.length < maxTracks) {
      const res = await this._request(nextPageUrl);

      for (const track of res['items']) {
        try {
          tracks.push({
            resourceId: track['id'],
            provider: ResourceProviderEnum.SPOTIFY,
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

      nextPageUrl = res['next'];
    }

    return tracks;
  }

  private async _getTopArtists(): Promise<Partial<Resource>[]> {
    if (!this.scopes.includes('user-top-read')) {
      return [];
    }

    let nextPageUrl = 'https://api.spotify.com/v1/me/top/artists';
    const maxArtists = 50;

    const artists: Partial<Resource>[] = [];

    while (nextPageUrl && artists.length < maxArtists) {
      const res = await this._request(nextPageUrl);

      for (const artist of res['items']) {
        try {
          artists.push({
            resourceId: artist['id'],
            provider: ResourceProviderEnum.SPOTIFY,
            type: ResourceTypeEnum.ARTIST,
            data: {
              name: artist['name'],
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

      nextPageUrl = res['next'];
    }

    return artists;
  }

  async synchronize(userId: string): Promise<void> {
    await this._initialize(userId);

    const tracks = await this._getTopTracks();
    const artists = await this._getTopArtists();
    const resources = [...tracks, ...artists];

    await this.resourcesService.createMany(resources);

    const interests: Partial<Interest>[] = resources.map((r) => ({
      userId,
      resourceId: r.resourceId,
    }));

    await this.interestsService.createMany(interests);
  }
}
