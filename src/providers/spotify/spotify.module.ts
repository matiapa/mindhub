import { Module } from '@nestjs/common';
import { SpotifyAuthService } from './spotify-auth.service';
import { SpotifyEtlService } from './spotify-etl.service';
import { ProvidersModule } from '../../features/providers/providers.module';
import { ResourcesModule } from '../../features/resources';
import { InterestsModule } from '../../features/interests';

@Module({
  imports: [ProvidersModule, ResourcesModule, InterestsModule],
  providers: [SpotifyAuthService, SpotifyEtlService],
  exports: [SpotifyAuthService, SpotifyEtlService],
})
export class SpotifyModule {}
