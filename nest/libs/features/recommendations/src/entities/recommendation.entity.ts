import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseMongooseEntity } from 'libs/utils/entities/base-mongoose-entity';

export class RecommendationScore {
  @Prop({ required: true })
  global: number;

  @Prop({ type: Object, required: true, _id: false })
  friendship: object;

  @Prop({ type: Object, required: true, _id: false })
  interests: object;
}

class Reviewed {
  @Prop({ required: true })
  accepted: boolean;

  @Prop({ required: true })
  date: string;
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
}

export const RecommendationSchema =
  SchemaFactory.createForClass(Recommendation);
