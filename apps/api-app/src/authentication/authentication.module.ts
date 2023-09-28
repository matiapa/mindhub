import { Module } from '@nestjs/common';
import { SpotifyAuthController } from './spotify-auth.controller';
import { ProvidersModule } from '@Feature/providers';

@Module({
  imports: [ProvidersModule],
  controllers: [SpotifyAuthController],
})
export class AuthenticationModule {}
