import { Module } from '@nestjs/common';
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
import { ProvidersConnService } from './services/conn.service';
import {
  ProviderConnection,
  ProviderConnectionSchema,
} from './entities/connection.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { ProvidersConnRepository } from './repositories/connection.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProviderConnection.name, schema: ProviderConnectionSchema },
    ]),
    InterestsModule,
    TextsModule,
    SpotifyModule,
    TwitterModule,
    QueueModule,
    StorageModule,
  ],
  providers: [
    ProvidersConnService,
    ProvidersConnRepository,
    ProvidersAuthService,
    ProvidersFileService,
    ProvidersSyncRequestService,
    ProvidersSyncHandlerService,
    ProviderServices,
  ],
  exports: [
    ProvidersConnService,
    ProvidersAuthService,
    ProvidersFileService,
    ProvidersSyncHandlerService,
  ],
})
export class ProvidersModule {}
