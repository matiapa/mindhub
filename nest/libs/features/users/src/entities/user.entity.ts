import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseMongooseEntity } from 'libs/utils/entities/base-mongoose-entity';

export enum Gender {
  MAN = 'man',
  WOMAN = 'woman',
  OTHER = 'other',
}

export enum SignupState {
  PENDING_PROFILE = 'pending_profile',
  PENDING_PROVIDERS = 'pending_providers',
  PENDING_RECOMMENDATIONS = 'pending_recommendations',
  ACTIVE = 'active',
}

class Location {
  @Prop({ type: String, enum: ['Point'], required: true })
  type: 'Point';

  @Prop({ type: [Number], required: true })
  coordinates: number[];
}

class LastConnection {
  @Prop({ required: false, _id: false })
  location?: Location;

  @Prop({ required: true })
  date: Date;
}

class Profile {
  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: Gender, required: true })
  gender: Gender;

  @Prop({ required: true })
  birthday: Date;

  @Prop({ required: false })
  biography?: string;
}

@Schema({ timestamps: true })
export class User extends BaseMongooseEntity {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true, _id: false })
  profile: Profile;

  @Prop({ required: false, _id: false })
  lastConnection?: LastConnection;

  @Prop({ required: true, enum: SignupState })
  signupState: SignupState;
}

export const UserSchema = SchemaFactory.createForClass(User);
