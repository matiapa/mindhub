import { IsNotEmpty } from 'class-validator';

export class NotificationsConfig {
  @IsNotEmpty()
  uuidNamespace: string = 'DEPRECATED_FIELD';
}
