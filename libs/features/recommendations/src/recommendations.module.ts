import { Module } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { UsersModule } from '@Feature/users';
import { InterestsModule } from '@Feature/interests';
import { FriendshipsModule } from '@Feature/friendships';

@Module({
  imports: [UsersModule, InterestsModule, FriendshipsModule],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
