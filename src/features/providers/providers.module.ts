import { Module } from '@nestjs/common';
import { TokensRepository } from './repositories/tokens.repository';
import { AuthenticationService } from './services/authentication.service';
import { SynchronizationService } from '.';

@Module({
  providers: [TokensRepository, AuthenticationService, SynchronizationService],
  exports: [AuthenticationService, SynchronizationService],
})
export class ProvidersModule {}
