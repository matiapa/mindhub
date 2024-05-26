import { ProviderEnum } from '@Feature/providers';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseMongooseEntity } from 'libs/utils/entities/base-mongoose-entity';

@Schema({ timestamps: true })
export class Text extends BaseMongooseEntity {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: String, enum: ProviderEnum, required: true })
  provider: ProviderEnum;

  @Prop({ required: true })
  rawText: string;

  @Prop({ required: true })
  language: string; // ISO 639-1 code

  @Prop({ required: false })
  date?: Date;
}

export const TextSchema = SchemaFactory.createForClass(Text);

TextSchema.index({ userId: 1 });
