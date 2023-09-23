import { Controller, Get, Query, Response } from '@nestjs/common';
import { SpotifyAuthService } from '../../providers/spotify';

@Controller('/spotify')
export class SpotifyController {
  constructor(private readonly spotifyAuthService: SpotifyAuthService) {}

  @Get('/login')
  login(): string {
    return this.spotifyAuthService.getLoginUrl();
  }

  @Get('/redeemCode')
  async redeemCode(
    @Query('state') state: string,
    @Query('code') code: string,
    @Query('error') error: string,
    @Response() res: any,
  ): Promise<void> {
    const url = await this.spotifyAuthService.redeemAuthCode(
      state,
      code,
      error,
    );
    res.redirect(url);
  }
}
