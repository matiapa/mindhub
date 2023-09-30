import { Module } from '@nestjs/common';
import { SpotifyAuthController } from './spotify-auth.controller';
import { ProvidersModule } from '@Feature/providers';
import { AuthenticationModule } from '@Provider/authentication';

@Module({
  imports: [ProvidersModule, AuthenticationModule],
  controllers: [SpotifyAuthController],
})
export class ApiProvidersModule {}
