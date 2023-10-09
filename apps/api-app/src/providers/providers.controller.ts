import { ProvidersConfig } from '@Feature/providers';
import { AuthenticationService } from '@Provider/authentication';
import { QueueService } from '@Provider/queue';
import {
  Controller,
  Get,
  Logger,
  NotImplementedException,
} from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '@Provider/storage';
import { ProvidersFileService } from '@Feature/providers/services/files.service';

@Controller('/providers')
export class ProvidersController {
  private readonly logger = new Logger(ProvidersController.name);
  private config: ProvidersConfig;

  constructor(
    private readonly fileService: ProvidersFileService,
    private readonly queueService: QueueService,
    private readonly storageService: StorageService,
    private readonly authService: AuthenticationService,
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

    await this.fileService.handleFileUploaded(event.key);
  };

  @Get('/providers')
  @ApiOperation({
    summary: 'Get the list of connected providers',
  })
  @ApiOkResponse({ description: 'OK' })
  login() {
    // TODO: Implement this method
    const _authId = this.authService.getAuthenticadedUserId();
    throw new NotImplementedException(_authId);
  }
}
