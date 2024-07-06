import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationPayload, NotificationType } from '../entities/notification.entity';
import {
  PaginatedReqDto,
  PaginatedResDto,
} from 'libs/utils/dtos/paginated.dto';

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
}

export class GetNotificationsResDto {
  @IsArray()
  @Type(() => NotificationDto)
  @ValidateNested({ each: true })
  notifications: NotificationDto[];
}
