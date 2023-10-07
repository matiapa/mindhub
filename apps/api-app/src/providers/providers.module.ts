import { Module } from '@nestjs/common';
import { SpotifyController } from './spotify.controller';
import { ProvidersModule } from '@Feature/providers';
import { AuthenticationModule } from '@Provider/authentication';
import { TwitterController } from './twitter.controller';

@Module({
  imports: [ProvidersModule, AuthenticationModule],
  controllers: [SpotifyController, TwitterController],
})
export class ApiProvidersModule {}
