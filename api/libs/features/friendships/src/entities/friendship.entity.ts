import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export enum FriendshipStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class Friendship {
  @Prop({ required: true })
  proposer: string;

  @Prop({ required: true })
  target: string;

  @Prop({ type: String, enum: FriendshipStatus, required: true })
  status: FriendshipStatus;
}

export const FriendshipSchema = SchemaFactory.createForClass(Friendship);

FriendshipSchema.index({ proposer: 1 });

FriendshipSchema.index({ target: 1 });
