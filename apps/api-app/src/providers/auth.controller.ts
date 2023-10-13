import { ProvidersAuthService, ProviderEnum } from '@Feature/providers';
import {
  AuthGuard,
  AuthUser,
} from '@Provider/authentication/authentication.guard';
import { PrincipalData } from '@Provider/authentication/authentication.types';
import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Response,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@Controller('/provider/:providerName')
export class AuthController {
  constructor(private readonly providersAuthService: ProvidersAuthService) {}

  @Get('/login')
  @ApiOperation({
    summary: 'Get the URL for starting the authentication flow',
  })
  @ApiOkResponse({ description: 'OK' })
  @UseGuards(AuthGuard)
  login(
    @Param('providerName') providerName: string,
    @AuthUser() user: PrincipalData,
    @Response() res: any,
  ) {
    if (!(providerName in ProviderEnum))
      throw new BadRequestException('Invalid provider');

    const loginUrl = this.providersAuthService.getLoginUrl(
      user.id,
      providerName as ProviderEnum,
    );
    res.redirect(loginUrl);
  }

  @Get('/redeemCode')
  @ApiOperation({
    summary: 'Redeem the obtained code to finalize authentication flow',
  })
  @ApiOkResponse({ description: 'OK' })
  @UseGuards(AuthGuard)
  async redeemCode(
    @Param('providerName') providerName: string,
    @Query('state') state: string,
    @Query('code') code: string,
    @Query('error') error: string,
    @AuthUser() user: PrincipalData,
    @Response() res: any,
  ): Promise<void> {
    if (!(providerName in ProviderEnum))
      throw new BadRequestException('Invalid provider');

    const data = await this.providersAuthService.redeemCode(
      providerName as ProviderEnum,
      user.id,
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
