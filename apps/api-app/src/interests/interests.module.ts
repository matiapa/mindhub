import { Module } from '@nestjs/common';
import { InterestsController } from './interests.controller';
import { InterestsModule } from '@Feature/interests';

@Module({
  imports: [InterestsModule],
  controllers: [InterestsController],
})
export class ApiInterestsModule {}
