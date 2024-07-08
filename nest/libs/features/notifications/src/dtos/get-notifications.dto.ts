import {
  IsArray,
  IsBoolean,
  IsBooleanString,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationPayload, NotificationType } from '../entities/notification.entity';

export class NotificationDto {
  @IsString()
  _id: string;

  @IsString()
  @IsNotEmpty()
  targetUserId: string;

  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  // @Type(() => NotificationPayload)
  // @ValidateNested()
  payload: NotificationPayload;

  @IsDate()
  @IsNotEmpty()
  date: Date;

  @IsBoolean()
  @IsNotEmpty()
  seen: boolean;
}

export class GetNotificationsReqDto {
  @IsBooleanString()
  @IsOptional()
  onlyNew?: string;
}


export class GetNotificationsResDto {
  @IsArray()
  @Type(() => NotificationDto)
  @ValidateNested({ each: true })
  notifications: NotificationDto[];
}
