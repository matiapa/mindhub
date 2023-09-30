import { AuthenticationService, ProviderEnum } from '@Feature/providers';
import { Controller, Get, Query, Response } from '@nestjs/common';

@Controller('/spotify')
export class SpotifyAuthController {
  constructor(private readonly authService: AuthenticationService) {}

  @Get('/login')
  login(@Response() res: any) {
    const loginUrl = this.authService.getLoginUrl(ProviderEnum.SPOTIFY);
    res.redirect(loginUrl);
  }

  @Get('/redeemCode')
  async redeemCode(
    @Query('userId') userId: string,
    @Query('code') code: string,
    @Query('error') error: string,
    @Response() res: any,
  ): Promise<void> {
    const data = await this.authService.redeemCode(
      ProviderEnum.SPOTIFY,
      userId,
      code,
      error,
    );

    const redirectUrl =
      data.url +
      new URLSearchParams({
        status: data.status,
        reason: data.reason ?? '',
      }).toString();

    res.redirect(redirectUrl);
  }
}
