import { UsersModule } from '@Feature/users';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { AuthenticationModule } from '@Provider/authentication';

@Module({
  imports: [UsersModule, AuthenticationModule],
  controllers: [UsersController],
})
export class ApiUsersModule {}
