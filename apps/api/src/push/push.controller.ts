import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PushService } from './push.service';
import { CreatePushSubscriptionDto, UnsubscribePushDto } from './dto/push-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import type { RequestWithUser } from '../auth/types';

@Controller('push')
@UseGuards(JwtAuthGuard)
export class PushController {
  constructor(private pushService: PushService) {}

  @Public()
  @Get('vapid-key')
  getVapidKey() {
    return { publicKey: this.pushService.getVapidPublicKey() };
  }

  @Post('subscribe')
  async subscribe(@Request() req: RequestWithUser, @Body() dto: CreatePushSubscriptionDto) {
    await this.pushService.subscribe(req.user.sub, dto);
    return { success: true };
  }

  @Post('unsubscribe')
  async unsubscribe(@Request() req: RequestWithUser, @Body() dto: UnsubscribePushDto) {
    await this.pushService.unsubscribe(req.user.sub, dto.endpoint);
    return { success: true };
  }

  @Get('subscriptions')
  async getSubscriptions(@Request() req: RequestWithUser) {
    return this.pushService.getSubscriptions(req.user.sub);
  }
}
