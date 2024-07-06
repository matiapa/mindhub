import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseMongooseEntity } from 'libs/utils/entities/base-mongoose-entity';

@Schema({ timestamps: true, collection: 'bigfive' })
export class Personality extends BaseMongooseEntity {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  o: number;

  @Prop({ required: true })
  c: number;

  @Prop({ required: true })
  e: number;

  @Prop({ required: true })
  a: number;

  @Prop({ required: true })
  n: number;

  @Prop({ required: true })
  generatedAt: Date;
}

export const PersonalitySchema = SchemaFactory.createForClass(Personality);
