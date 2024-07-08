import { IsNotEmpty, IsString } from 'class-validator';

export class NotificationsConfig {
  @IsString()
  @IsNotEmpty()
  vapidSubject: string = process.env.NOTIFICATIONS_VAPID_SUBJECT;

  @IsString()
  @IsNotEmpty()
  vapidPublicKey: string = process.env.NOTIFICATIONS_VAPID_PUBLIC_KEY;

  @IsString()
  @IsNotEmpty()
  vapidPrivateKey: string = process.env.NOTIFICATIONS_VAPID_PRIVATE_KEY;
}
