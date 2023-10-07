import { Module } from '@nestjs/common';
import { TokensRepository } from './repositories/tokens.repository';
import { ProvidersAuthService } from './services/auth.service';
import { InterestsModule } from '@Feature/interests';
import { SpotifyModule } from 'libs/providers/spotify/src';
import { QueueModule } from '@Provider/queue';
import { TwitterModule } from '@Provider/twitter';
import { ProvidersFileService } from './services/files.service';
import { ProvidersSyncHandlerService } from './services/sync-handler.service';
import { StorageModule } from '@Provider/storage';
import { ProvidersSyncRequestService } from './services/sync-request.service';
import { TextsModule } from '@Feature/texts';
import { ProviderServices } from './types/provider.factory';

@Module({
  imports: [
    InterestsModule,
    TextsModule,
    SpotifyModule,
    TwitterModule,
    QueueModule,
    StorageModule,
  ],
  providers: [
    ProvidersAuthService,
    ProvidersFileService,
    ProvidersSyncRequestService,
    ProvidersSyncHandlerService,
    ProviderServices,
    TokensRepository,
  ],
  exports: [
    ProvidersAuthService,
    ProvidersFileService,
    ProvidersSyncHandlerService,
  ],
})
export class ProvidersModule {}
