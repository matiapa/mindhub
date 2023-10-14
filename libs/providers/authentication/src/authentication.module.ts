import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthGuard } from './authentication.guard';

@Module({
  providers: [AuthenticationService, AuthGuard],
  exports: [AuthenticationService, AuthGuard],
})
export class AuthenticationModule {}
