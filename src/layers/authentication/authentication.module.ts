import { Module } from '@nestjs/common';
import { SpotifyController } from './spotify.controller';
import { SpotifyModule } from '../../providers/spotify';

@Module({
  imports: [SpotifyModule],
  controllers: [SpotifyController],
})
export class AuthenticationModule {}
