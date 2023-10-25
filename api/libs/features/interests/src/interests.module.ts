import { Module } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { InterestsRepository } from './interests.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Interest, InterestSchema } from './entities/interest.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Interest.name, schema: InterestSchema },
    ]),
  ],
  providers: [InterestsService, InterestsRepository],
  exports: [InterestsService],
})
export class InterestsModule {}
