import { ProviderEnum } from '@Feature/providers';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Text {
  @Prop({ required: true })
  _id?: string;

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
