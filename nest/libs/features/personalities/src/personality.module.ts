import { Module } from '@nestjs/common';
import { PersonalitiesService } from './personality.service';
import { PersonalitiesRepository } from './personality.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Personality, PersonalitySchema } from './entities/personality.entity';
import { QueueModule } from '@Provider/queue';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Personality.name, schema: PersonalitySchema }]),
    QueueModule
  ],
  providers: [PersonalitiesService, PersonalitiesRepository],
  exports: [PersonalitiesService],
})
export class PersonalitiesModule {}
