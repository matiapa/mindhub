import { InterestsService } from '@Feature/interests';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RecommendationsService {
  constructor(private interestsService: InterestsService) {}

  public calculateRecommendations(targetUserId: string) {
    // Get the preferences of the user

    // Now we will bring all users, but then we may only bring
    // the ones that are nearest based on Big Five model
    // also we may apply filters based on preferences

    const users = [];

    for (const user of users) {
      // this.get(sh)
    }
  }
}
