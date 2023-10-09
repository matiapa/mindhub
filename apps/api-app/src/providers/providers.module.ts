import { Module } from '@nestjs/common';
import { SpotifyController } from './spotify.controller';
import { ProvidersModule } from '@Feature/providers';
import { AuthenticationModule } from '@Provider/authentication';
import { TwitterController } from './twitter.controller';
import { ProvidersController } from './providers.controller';
import { QueueModule } from '@Provider/queue';
import { StorageModule } from '@Provider/storage';

@Module({
  imports: [ProvidersModule, QueueModule, StorageModule, AuthenticationModule],
  controllers: [ProvidersController, SpotifyController, TwitterController],
})
export class ApiProvidersModule {}
