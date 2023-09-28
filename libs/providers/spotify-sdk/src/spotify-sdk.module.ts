import { Module } from '@nestjs/common';
import { SpotifyAuthService } from './spotify-auth.service';
import { SpotifyEtlService } from './spotify-etl.service';

@Module({
  providers: [SpotifyAuthService, SpotifyEtlService],
  exports: [SpotifyAuthService, SpotifyEtlService],
})
export class SpotifySdkModule {}
