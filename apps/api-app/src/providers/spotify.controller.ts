import { ProvidersAuthService, ProviderEnum } from '@Feature/providers';
import { AuthenticationService } from '@Provider/authentication';
import { Controller, Get, Query, Response } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@Controller('/spotify')
export class SpotifyController {
  constructor(
    private readonly providersAuthService: ProvidersAuthService,
    private readonly authService: AuthenticationService,
  ) {}

  @Get('/login')
  @ApiOperation({
    summary: 'Get the URL for starting the authentication flow',
  })
  @ApiOkResponse({ description: 'OK' })
  login(@Response() res: any) {
    const loginUrl = this.providersAuthService.getLoginUrl(
      this.authService.getAuthenticadedUserId(),
      ProviderEnum.SPOTIFY,
    );
    res.redirect(loginUrl);
  }

  @Get('/redeemCode')
  @ApiOperation({
    summary: 'Redeem the obtained code to finalize authentication flow',
  })
  @ApiOkResponse({ description: 'OK' })
  async redeemCode(
    @Query('state') state: string,
    @Query('code') code: string,
    @Query('error') error: string,
    @Response() res: any,
  ): Promise<void> {
    const data = await this.providersAuthService.redeemCode(
      ProviderEnum.SPOTIFY,
      this.authService.getAuthenticadedUserId(),
      state,
      code,
      error,
    );

    const redirectUrl =
      `${data.url}/?` +
      new URLSearchParams({
        status: data.status,
        reason: data.reason ?? '',
      }).toString();

    res.redirect(redirectUrl);
  }
}
