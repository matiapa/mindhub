import { Module } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { InterestsRepository } from './interests.repository';

@Module({
  providers: [InterestsService, InterestsRepository],
  exports: [InterestsService],
})
export class InterestsModule {}
