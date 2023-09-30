import { Module } from '@nestjs/common';
import { InterestsController } from './interests.controller';
import { InterestsModule } from '@Feature/interests';
import { AuthenticationModule } from '@Provider/authentication';

@Module({
  imports: [InterestsModule, AuthenticationModule],
  controllers: [InterestsController],
})
export class ApiInterestsModule {}
