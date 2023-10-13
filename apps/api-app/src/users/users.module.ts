import { UsersModule } from '@Feature/users';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';

@Module({
  imports: [UsersModule],
  controllers: [UsersController],
})
export class ApiUsersModule {}
