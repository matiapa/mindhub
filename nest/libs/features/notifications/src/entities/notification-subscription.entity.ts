import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseMongooseEntity } from 'libs/utils/entities/base-mongoose-entity';
import { Types } from 'mongoose';

class WebPushSubscriptionKeys {
  @Prop({ required: true })
  p256dh: string;

  @Prop({ required: true })
  auth: string;
}

class WebPushSubscription {
  @Prop({ required: true })
  endpoint: string;
  
  @Prop({ required: true, _id: false })
  keys: WebPushSubscriptionKeys;
};

@Schema({ timestamps: true })
export class NotificationSubscription extends BaseMongooseEntity {
  @Prop({ type: Types.ObjectId, required: true })
  _id?: Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, _id: false })
  webPushSubscription: WebPushSubscription;
}

export const NotificationSubscriptionSchema = SchemaFactory.createForClass(NotificationSubscription);

NotificationSubscriptionSchema.index({ userId: 1 });
