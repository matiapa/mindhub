import { Module } from '@nestjs/common';
import { SynchronizationService } from '../../features/providers/services/synchronization.service';
import { SpotifyModule } from '../../providers/spotify';

@Module({
  imports: [SpotifyModule],
  controllers: [SynchronizationService],
})
export class ExtractionModule {}
