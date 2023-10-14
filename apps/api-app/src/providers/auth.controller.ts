import { ProvidersAuthService, ProviderEnum } from '@Feature/providers';
import {
  AuthGuard,
  AuthUser,
} from '@Provider/authentication/authentication.guard';
import { PrincipalData } from '@Provider/authentication/authentication.types';
import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@Controller('/providers/:providerName')
export class AuthController {
  constructor(
    private readonly providersAuthService: ProvidersAuthService,
    private readonly authService: AuthGuard,
  ) {}

  @Get('/login')
  @ApiOperation({
    summary: 'Get the URL for starting the authentication flow',
  })
  @ApiOkResponse({ description: 'OK' })
  @UseGuards(AuthGuard)
  login(
    @Param('providerName') providerName: string,
    @AuthUser() user: PrincipalData,
    @Request() req: any,
    // @Response() res: any,
  ) {
    // if (!(providerName in ProviderEnum))
    //   throw new BadRequestException('Invalid provider');

    const token = this.authService.extractTokenFromHeader(req);

    const loginUrl = this.providersAuthService.getLoginUrl(
      token,
      providerName as ProviderEnum,
    );
    return loginUrl;
  }

  @Get('/redeemCode')
  @ApiOperation({
    summary: 'Redeem the obtained code to finalize authentication flow',
  })
  @ApiOkResponse({ description: 'OK' })
  async redeemCode(
    @Param('providerName') providerName: string,
    @Query('state') state: string,
    @Query('code') code: string,
    @Query('error') error: string,
    @Response() res: any,
  ): Promise<void> {
    // if (!(providerName in ProviderEnum))
    //   throw new BadRequestException('Invalid provider');

    const decodedToken = await this.authService.verifyToken(state);
    const userId = decodedToken['sub'];

    const data = await this.providersAuthService.redeemCode(
      providerName as ProviderEnum,
      userId,
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
