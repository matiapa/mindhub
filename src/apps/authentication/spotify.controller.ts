import { Controller, Get, Query, Response } from '@nestjs/common';
import { AuthenticationService } from 'src/features/providers/providers.service';
import { ProviderEnum } from 'src/features/resources/enums';

@Controller('/spotify')
export class SpotifyController {
  constructor(private readonly providerService: AuthenticationService) {}

  @Get('/login')
  login(@Response() res: any) {
    const loginUrl = this.providerService.getLoginUrl(ProviderEnum.SPOTIFY);
    res.redirect(loginUrl);
  }

  @Get('/redeemCode')
  async redeemCode(
    @Query('userId') userId: string,
    @Query('code') code: string,
    @Query('error') error: string,
    @Response() res: any,
  ): Promise<void> {
    const data = await this.providerService.redeemCode(
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
