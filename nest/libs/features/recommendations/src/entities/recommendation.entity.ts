import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseMongooseEntity } from 'libs/utils/entities/base-mongoose-entity';

export class CategoryInterestsScore {
  @Prop({ required: true })
  artist: number;

  @Prop({ required: true })
  track: number;
}

export class InterestsScore {
  @Prop({ required: true })
  score: number;

  @Prop({ type: CategoryInterestsScore, required: true, _id: false })
  category: CategoryInterestsScore;
}

export class FriendshipScore {
  @Prop({ required: true })
  score: number;

  @Prop({ required: true })
  by_ratings: number;

  @Prop({ required: true })
  by_personality: number;
}

export class RecommendationScore {
  @Prop({ required: true })
  global: number;

  @Prop({ type: FriendshipScore, required: true, _id: false })
  friendship: FriendshipScore;

  @Prop({ type: InterestsScore, required: true, _id: false })
  interests: InterestsScore;
}

class Reviewed {
  @Prop({ required: true })
  accepted: boolean;

  @Prop({ required: true })
  date: Date;
}

@Schema({ timestamps: true })
export class Recommendation extends BaseMongooseEntity {
  @Prop({ required: true })
  targetUserId: string;

  @Prop({ required: true })
  recommendedUserId: string;

  @Prop({ required: true, _id: false })
  score: RecommendationScore;

  @Prop({ required: false, _id: false })
  reviewed?: Reviewed;

  @Prop({ required: true })
  generatedAt: Date;
}

export const RecommendationSchema =
  SchemaFactory.createForClass(Recommendation);
