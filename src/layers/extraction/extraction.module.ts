import { Module } from '@nestjs/common';
import { SpotifyEtlController } from './spotify.controller';
import { SpotifyModule } from '../../providers/spotify';

@Module({
  imports: [SpotifyModule],
  controllers: [SpotifyEtlController],
})
export class ExtractionModule {}
