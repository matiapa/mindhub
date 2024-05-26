import { ProviderEnum } from '@Feature/providers';
import { ResourceType } from '../enums/resource-type.enum';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseMongooseEntity } from 'libs/utils/entities/base-mongoose-entity';

export enum InterestRelevance {
  NORMAL = 'normal',
  FAVORITE = 'favorite',
}

export class Resource {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: ResourceType, required: true })
  type: ResourceType;
}

@Schema({ timestamps: true })
export class Interest extends BaseMongooseEntity {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, type: String, enum: ProviderEnum })
  provider: ProviderEnum;

  @Prop({ required: true, type: String, enum: InterestRelevance })
  relevance: InterestRelevance;

  @Prop({ required: true, _id: false })
  resource: Resource;

  @Prop({ required: false })
  date?: Date;
}

export const InterestSchema = SchemaFactory.createForClass(Interest);

InterestSchema.index({ userId: 1 });
