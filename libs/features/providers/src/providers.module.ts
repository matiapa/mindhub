import { Module } from '@nestjs/common';
import { TokensRepository } from './repositories/tokens.repository';
import { AuthenticationService } from './services/authentication.service';
import { SynchronizationService } from '.';
import { InterestsModule } from '@Feature/interests';
import { SpotifySdkModule } from '@Provider/spotify-sdk';
import { QueueModule } from '@Provider/queue';

@Module({
  imports: [SpotifySdkModule, QueueModule, InterestsModule],
  providers: [TokensRepository, AuthenticationService, SynchronizationService],
  exports: [AuthenticationService, SynchronizationService],
})
export class ProvidersModule {}
