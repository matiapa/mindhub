import { ProviderEnum, ProvidersConfig } from '@Feature/providers';
import { ProvidersFileService } from '@Feature/providers/services/files.service';
import {
  AuthGuard,
  AuthUser,
} from '@Provider/authentication/authentication.guard';
import { PrincipalData } from '@Provider/authentication/authentication.types';
import { QueueService } from '@Provider/queue';
import { StorageService } from '@Provider/storage';
import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@Controller('/provider/:providerName')
export class FileController {
  private readonly logger = new Logger(FileController.name);
  private config: ProvidersConfig;

  constructor(
    private readonly providersFileService: ProvidersFileService,
    private readonly queueService: QueueService,
    private readonly storageService: StorageService,
    readonly configService: ConfigService,
  ) {
    this.config = configService.get<ProvidersConfig>('providers');
    this._initialize();
  }

  private _initialize() {
    this.queueService.registerHandler(
      this.config.file.uploadedQueueUrl,
      this.handleFileUploaded,
    );
  }

  handleFileUploaded = async (eventMessage: any) => {
    const event = this.storageService.parseStorageEvent(eventMessage);
    if (!event) {
      this.logger.warn('Received an invalid message', eventMessage);
      return;
    }

    await this.providersFileService.handleFileUploaded(event.key);
  };

  @Get('/fileUploadUrl')
  @ApiOperation({
    summary: 'Get the URL for uploading Twitter data file as a ZIP',
  })
  @ApiOkResponse({ description: 'OK' })
  @UseGuards(AuthGuard)
  getFileUploadUrl(
    @Param('providerName') providerName: string,
    @AuthUser() user: PrincipalData,
  ): Promise<string> {
    if (!(providerName in ProviderEnum))
      throw new BadRequestException('Invalid provider');

    return this.providersFileService.getUploadUrl(
      user.id,
      providerName as ProviderEnum,
    );
  }
}
