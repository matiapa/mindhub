import { ProviderEnum } from '@Feature/providers';
import { ProvidersFileService } from '@Feature/providers/services/files.service';
import { AuthenticationService } from '@Provider/authentication';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@Controller('/twitter')
export class TwitterController {
  constructor(
    private readonly providersFileService: ProvidersFileService,
    private readonly authService: AuthenticationService,
  ) {}

  @Get('/fileUploadUrl')
  @ApiOperation({
    summary: 'Get the URL for uploading Twitter data file as a ZIP',
  })
  @ApiOkResponse({ description: 'OK' })
  getFileUploadUrl(): Promise<string> {
    return this.providersFileService.getUploadUrl(
      this.authService.getAuthenticadedUserId(),
      ProviderEnum.TWITTER,
    );
  }
}
