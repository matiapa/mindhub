import { BaseMongooseEntity } from 'libs/utils/entities/base-mongoose-entity';
import { ProviderEnum } from '../enums/providers.enum';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

class FileConn {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  date: Date;
}

class OAuthConn {
  @Prop({ required: true })
  refreshToken: string;

  @Prop({ required: true })
  scopes: string;

  @Prop({ required: true })
  date: Date;
}

@Schema()
export class ProviderConnection extends BaseMongooseEntity {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: String, enum: ProviderEnum, required: true })
  provider: ProviderEnum;

  @Prop({ required: false, _id: false })
  oauth?: OAuthConn;

  @Prop({ required: false, _id: false })
  file?: FileConn;
}

export const ProviderConnectionSchema =
  SchemaFactory.createForClass(ProviderConnection);
