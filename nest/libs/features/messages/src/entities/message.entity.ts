import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseMongooseEntity } from 'libs/utils/entities/base-mongoose-entity';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends BaseMongooseEntity {
  // @Prop({ type: Types.ObjectId, required: true })
  // _id?: Types.ObjectId;

  @Prop({ required: true })
  sender: string;

  @Prop({ required: true })
  receiver: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  seen: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ sender: 1 });

MessageSchema.index({ receiver: 1 });
