import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseMongooseEntity } from 'libs/utils/entities/base-mongoose-entity';
// import { Types } from 'mongoose';

export class NotificationFriendshipProposalPayload {
  counterpartyName: string;
}

export class NotificationFriendshipRequestPayload {
  counterpartyName: string;
}

export class NotificationNewMessagePayload {
  senderName: string;
  message: string;
}

export type NotificationPayload =
  | NotificationNewMessagePayload
  | NotificationFriendshipRequestPayload
  | NotificationFriendshipProposalPayload;

export enum NotificationType {
  NEW_MESSAGE = 'new_message',
  NEW_FRIENDSHIP_REQUEST = 'new_friendship_request',
  ACCEPTED_FRIENDSHIP_PROPOSAL = 'accepted_friendship_proposal',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class Notification extends BaseMongooseEntity {
  // @Prop({ type: Types.ObjectId, required: true })
  // _id?: Types.ObjectId;

  @Prop({ required: true })
  targetUserId: string;

  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ type: Object, required: true })
  payload: NotificationPayload;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  seen: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ userId: 1 });
