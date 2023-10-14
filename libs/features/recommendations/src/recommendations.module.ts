import { Module } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { UsersModule } from '@Feature/users';
import { InterestsModule } from '@Feature/interests';
import { FriendshipsModule } from '@Feature/friendships';
import { RecommendationRepository } from './recommendation.repository';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Recommendation,
  RecommendationSchema,
} from './entities/recommendation.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Recommendation.name, schema: RecommendationSchema },
    ]),
    UsersModule,
    InterestsModule,
    FriendshipsModule,
  ],
  providers: [RecommendationsService, RecommendationRepository],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
