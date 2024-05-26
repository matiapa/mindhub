import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseMongooseEntity } from 'libs/utils/entities/base-mongoose-entity';

@Schema({ timestamps: true })
export class Rate extends BaseMongooseEntity {
  @Prop({ required: true })
  rater: string;

  @Prop({ required: true })
  ratee: string;

  @Prop({ required: true })
  rating: number;
}

export const RateSchema = SchemaFactory.createForClass(Rate);

RateSchema.index({ rater: 1 });

RateSchema.index({ ratee: 1 });
