import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import * as webpush from 'web-push';
import type { CreatePushSubscriptionDto } from './dto/push-subscription.dto';

// Push subscriptions are re-upserted (bumping `updatedAt`) every time a client
// re-subscribes, which happens on every sign-in. Anything untouched for this
// long is almost certainly a dead endpoint — purge to keep the table tight
// and reduce dead-letter work for `sendNotification`.
const STALE_SUBSCRIPTION_THRESHOLD_DAYS = 180;

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly isConfigured: boolean;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY', '');
    const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY', '');
    const subject = this.configService.get<string>(
      'VAPID_SUBJECT',
      'mailto:admin@dourobatspadel.com'
    );

    if (publicKey && privateKey) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      this.isConfigured = true;
    } else {
      this.logger.warn('[PUSH] VAPID keys not configured. Push notifications will not be sent.');
      this.isConfigured = false;
    }
  }

  getVapidPublicKey(): string {
    return this.configService.get<string>('VAPID_PUBLIC_KEY', '');
  }

  async subscribe(userId: string, dto: CreatePushSubscriptionDto) {
    return this.prisma.pushSubscription.upsert({
      where: { endpoint: dto.endpoint },
      update: {
        userId,
        p256dh: dto.p256dh,
        auth: dto.auth,
      },
      create: {
        userId,
        endpoint: dto.endpoint,
        p256dh: dto.p256dh,
        auth: dto.auth,
      },
    });
  }

  async unsubscribe(userId: string, endpoint: string) {
    await this.prisma.pushSubscription.deleteMany({
      where: { userId, endpoint },
    });
  }

  async unsubscribeAll(userId: string) {
    await this.prisma.pushSubscription.deleteMany({
      where: { userId },
    });
  }

  async getSubscriptions(userId: string) {
    return this.prisma.pushSubscription.findMany({
      where: { userId },
      select: { id: true, endpoint: true, createdAt: true },
    });
  }

  async sendToUser(userId: string, payload: PushPayload) {
    if (!this.isConfigured) return;

    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });

    await Promise.allSettled(subscriptions.map((sub) => this.sendNotification(sub, payload)));
  }

  async sendToUsers(userIds: string[], payload: PushPayload) {
    if (!this.isConfigured) return;

    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId: { in: userIds } },
    });

    await Promise.allSettled(subscriptions.map((sub) => this.sendNotification(sub, payload)));
  }

  private async sendNotification(
    subscription: { endpoint: string; p256dh: string; auth: string },
    payload: PushPayload
  ) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        JSON.stringify(payload)
      );
    } catch (error) {
      // web-push throws `WebPushError` with a numeric `statusCode`. 404/410
      // means the subscription is gone on the push service; purge our copy.
      // `deleteMany` is intentional (instead of `delete`) — it's idempotent
      // so concurrent sends to the same endpoint can both cleanup safely.
      const statusCode =
        typeof error === 'object' && error !== null && 'statusCode' in error
          ? (error as { statusCode?: number }).statusCode
          : undefined;

      if (statusCode === 410 || statusCode === 404) {
        this.logger.log(`[PUSH] Removing expired subscription: ${subscription.endpoint}`);
        await this.prisma.pushSubscription.deleteMany({
          where: { endpoint: subscription.endpoint },
        });
        return;
      }

      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`[PUSH] Failed to send notification: ${message}`);
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async pruneStaleSubscriptions() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - STALE_SUBSCRIPTION_THRESHOLD_DAYS);

    const result = await this.prisma.pushSubscription.deleteMany({
      where: { updatedAt: { lt: cutoff } },
    });

    if (result.count > 0) {
      this.logger.log(
        `[PUSH] Pruned ${result.count} stale subscription(s) older than ${cutoff.toISOString()}`
      );
    }
  }
}
