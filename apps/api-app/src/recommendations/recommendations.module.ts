import { RecommendationsModule } from '@Feature/recommendations';
import { Module } from '@nestjs/common';
import { AuthenticationModule } from '@Provider/authentication';
import { RecommendationsController } from './recommendations.controller';

@Module({
  imports: [RecommendationsModule, AuthenticationModule],
  controllers: [RecommendationsController],
})
export class ApiRecommendationsModule {}
