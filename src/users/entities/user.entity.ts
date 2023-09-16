import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  age: number;

  @Prop({ required: false })
  lastConnection?: LastConnection;
}

class LastConnection {
  @Prop({ required: false })
  lat?: number;

  @Prop({ required: false })
  long?: number;

  @Prop({ required: true })
  date: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
