import { Controller, Post, Query } from '@nestjs/common';
import { SpotifyEtlService } from '../../providers/spotify';

@Controller('/spotify')
export class SpotifyEtlController {
  constructor(private readonly spotifyEtlService: SpotifyEtlService) {}

  @Post('/synchronize')
  synchronize(@Query('userId') userId: string): Promise<void> {
    return this.spotifyEtlService.synchronize(userId);
  }
}
