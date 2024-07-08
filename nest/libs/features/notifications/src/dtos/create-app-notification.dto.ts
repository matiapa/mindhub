import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { NotificationPayload, NotificationType } from '../entities/notification.entity';

export class CreateAppNotificationDto {
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
