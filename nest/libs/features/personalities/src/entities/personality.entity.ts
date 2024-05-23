import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, collection: 'bigfive' })
export class Personality {
  @Prop({ required: true })
  _id?: string;

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
}

export const PersonalitySchema = SchemaFactory.createForClass(Personality);
