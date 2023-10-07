import { Module } from '@nestjs/common';
import { SpotifyAuthService } from './spotify-auth.service';
import { SpotifySyncService } from './spotify-sync.service';

@Module({
  providers: [SpotifyAuthService, SpotifySyncService],
  exports: [SpotifyAuthService, SpotifySyncService],
})
export class SpotifyModule {}
