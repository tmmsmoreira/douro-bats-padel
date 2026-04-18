import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePushSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @IsString()
  @IsNotEmpty()
  p256dh: string;

  @IsString()
  @IsNotEmpty()
  auth: string;
}

export class UnsubscribePushDto {
  @IsString()
  @IsNotEmpty()
  endpoint: string;
}
