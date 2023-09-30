import { Module } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { InterestsRepository } from './interests.repository';
import { ResourcesModule } from '@Feature/resources';

@Module({
  imports: [ResourcesModule],
  providers: [InterestsService, InterestsRepository],
  exports: [InterestsService],
})
export class InterestsModule {}
