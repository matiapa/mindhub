import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { StorageModule } from '@Provider/storage';
import { AuthenticationModule } from '@Provider/authentication';
import { InterestsModule } from '@Feature/interests';

@Module({
  imports: [StorageModule, InterestsModule, AuthenticationModule],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
