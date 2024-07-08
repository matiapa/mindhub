import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';

class WebPushSubscriptionKeys {
  @IsString()
  @IsNotEmpty()
  p256dh: string;

  @IsString()
  @IsNotEmpty()
  auth: string;
}

class WebPushSubscription {
  @IsString()
  @IsNotEmpty()
  endpoint: string;
  
  @Type(() => WebPushSubscriptionKeys)
  @ValidateNested()
  @IsNotEmpty()
  keys: WebPushSubscriptionKeys;
};

export class SaveWebPushSubscriptionDto {
  @Type(() => WebPushSubscription)
  @ValidateNested()
  @IsNotEmpty()
  webPushSubscription: WebPushSubscription;
}
