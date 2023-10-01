import { RecommendationsService } from '@Feature/recommendations';
import { AuthenticationService } from '@Provider/authentication';
import { Controller, Get } from '@nestjs/common';

@Controller('/recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
    private readonly authService: AuthenticationService,
  ) {}

  @Get('/')
  getRecommendations() {
    return this.recommendationsService.getReccomendations(
      this.authService.getAuthenticadedUserId(),
    );
  }
}
