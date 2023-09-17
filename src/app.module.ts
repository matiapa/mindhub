import { Module } from '@nestjs/common';
import { UsersModule } from './features/users/users.module';

@Module({
  imports: [UsersModule],
})
export class AppModule {}
