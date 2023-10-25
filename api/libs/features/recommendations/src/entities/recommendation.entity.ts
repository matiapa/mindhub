import { ResourceType } from '@Feature/interests/enums/resource-type.enum';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

class InterestScores {
  @Prop({ required: true })
  global: number;

  @Prop({ required: true })
  [ResourceType.ARTIST]: number;

  @Prop({ required: true })
  [ResourceType.TRACK]: number;
}

class Reviewed {
  @Prop({ required: true })
  accepted: boolean;

  @Prop({ required: true })
  date: string;
}

@Schema({ timestamps: true })
export class Recommendation {
  @Prop({ required: true })
  targetUserId: string;

  @Prop({ required: true })
  recommendedUserId: string;

  @Prop({ required: true, _id: false })
  scores: InterestScores;

  @Prop({ required: false, _id: false })
  reviewed?: Reviewed;
}

export const RecommendationSchema =
  SchemaFactory.createForClass(Recommendation);
