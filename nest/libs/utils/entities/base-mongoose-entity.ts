// import { Prop } from '@nestjs/mongoose';
// import { Types } from 'mongoose';

export class BaseMongooseEntity {
  // @Prop({ type: Types.ObjectId, required: true })
  // _id?: Types.ObjectId;

  // @Prop({ type: Date, required: false })
  createdAt?: Date;

  // @Prop({ type: Date, required: false })
  updatedAt?: Date;
}
