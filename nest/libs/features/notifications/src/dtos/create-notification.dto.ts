import { IsString, IsNotEmpty, IsEnum, IsDate, IsBoolean, ValidateNested } from 'class-validator';
import { NotificationPayload, NotificationType } from '../entities/notification.entity';
import { Type } from 'class-transformer';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  targetUserId: string;

  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  // @Type(() => NotificationPayload)
  // @ValidateNested()
  payload: NotificationPayload;

}
