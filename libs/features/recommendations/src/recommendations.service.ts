import { Injectable } from '@nestjs/common';
import { RecommendationRepository } from './recommendation.repository';
import { Recommendation } from './entities/recommendation.entity';
import { ReviewRecommendationDto } from './dtos/review-request.dto';
import { FriendshipsService } from '@Feature/friendships/friendships.service';

@Injectable()
export class RecommendationsService {
  constructor(
    private recommendationRepo: RecommendationRepository,
    private friendshipService: FriendshipsService,
  ) {}

  public async getRecommendations(
    recomendeeId: string,
  ): Promise<Recommendation[]> {
    return this.recommendationRepo.getByTargetUser(recomendeeId);
  }

  public async reviewRecommendation(
    recomendeeId: string,
    recommendedId: string,
    dto: ReviewRecommendationDto,
  ): Promise<void> {
    await this.recommendationRepo.update(recomendeeId, recommendedId, {
      reviewed: {
        accepted: dto.accept,
        date: new Date().toISOString(),
      },
    });

    if (dto.accept) {
      await this.friendshipService.proposeFriendship(
        recomendeeId,
        recommendedId,
      );
    }
  }
}
