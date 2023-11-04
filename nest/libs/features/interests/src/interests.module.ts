import { Module } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { InterestsRepository } from './interests.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Interest, InterestSchema } from './entities/interest.entity';
import { QueueModule } from '@Provider/queue';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Interest.name, schema: InterestSchema },
    ]),
    QueueModule
  ],
  providers: [InterestsService, InterestsRepository],
  exports: [InterestsService],
})
export class InterestsModule {}
