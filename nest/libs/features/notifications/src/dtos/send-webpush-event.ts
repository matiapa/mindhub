import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export enum WebPushEventType {
  NEW_CHAT_MESSAGE = 'new_chat_message',
  NEW_APP_NOTIFICATION = 'new_app_notification',
}

export class SendWebPushEventDto {
  @IsString()
  @IsNotEmpty()
  targetUserId: string;

  @IsEnum(WebPushEventType)
  @IsNotEmpty()
  eventType: WebPushEventType;

  eventPayload: any;
}
