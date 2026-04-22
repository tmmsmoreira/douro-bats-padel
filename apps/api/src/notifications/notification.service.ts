import { Injectable, Logger } from '@nestjs/common';
import { render } from '@react-email/components';
import { Locale } from '@padel/types';
import { EmailService } from './email.service';
import { PushService } from '../push/push.service';
import type { PushPayload } from '../push/push.service';
import RSVPConfirmationEmail, {
  getRsvpConfirmationSubject,
} from '../emails/rsvp-confirmation-email';
import WaitlistNotificationEmail, {
  getWaitlistSubject,
} from '../emails/waitlist-notification-email';
import PromotionNotificationEmail, {
  getPromotionSubject,
} from '../emails/promotion-notification-email';
import EventNotificationEmail, {
  getEventNotificationSubject,
} from '../emails/event-notification-email';
import { t } from '../i18n';

export interface EventNotificationData {
  id: string;
  title?: string | null;
  date: Date | string;
}

export interface NotificationRecipient {
  email: string;
  userId: string;
  preferredLanguage: Locale;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private emailService: EmailService,
    private pushService: PushService
  ) {}

  private async sendPush(userId: string | undefined, payload: PushPayload) {
    if (!userId) return;
    try {
      await this.pushService.sendToUser(userId, payload);
    } catch (error) {
      this.logger.error(`Failed to send push notification to user ${userId}:`, error);
    }
  }

  async sendRSVPConfirmation(
    email: string,
    name: string,
    event: EventNotificationData,
    locale: Locale,
    userId?: string
  ) {
    const eventTitle = event.title || t(locale, 'emails.defaults.gameNight');
    try {
      const eventDate =
        event.date instanceof Date ? event.date.toLocaleDateString() : String(event.date);
      const html = await render(
        RSVPConfirmationEmail({
          name,
          eventTitle,
          eventDate,
          locale,
        })
      );
      await this.emailService.sendEmail(
        email,
        getRsvpConfirmationSubject(locale, eventTitle),
        html
      );
    } catch (error) {
      this.logger.error(`Failed to send RSVP confirmation to ${email}:`, error);
    }

    await this.sendPush(userId, {
      title: t(locale, 'push.rsvpConfirmed.title'),
      body: t(locale, 'push.rsvpConfirmed.body', { event: eventTitle }),
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      url: `/events/${event.id}`,
      tag: `rsvp-${event.id}`,
    });
  }

  async sendWaitlistNotification(
    email: string,
    name: string,
    event: EventNotificationData,
    position: number,
    locale: Locale,
    userId?: string
  ) {
    const eventTitle = event.title || t(locale, 'emails.defaults.gameNight');
    try {
      const html = await render(
        WaitlistNotificationEmail({
          name,
          eventTitle,
          position,
          locale,
        })
      );
      await this.emailService.sendEmail(email, getWaitlistSubject(locale, eventTitle), html);
    } catch (error) {
      this.logger.error(`Failed to send waitlist notification to ${email}:`, error);
    }

    await this.sendPush(userId, {
      title: t(locale, 'push.waitlist.title'),
      body: t(locale, 'push.waitlist.body', { event: eventTitle, position }),
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      url: `/events/${event.id}`,
      tag: `rsvp-${event.id}`,
    });
  }

  async sendPromotionNotification(
    email: string,
    name: string,
    event: EventNotificationData,
    locale: Locale,
    userId?: string
  ) {
    const eventTitle = event.title || t(locale, 'emails.defaults.gameNight');
    try {
      const html = await render(
        PromotionNotificationEmail({
          name,
          eventTitle,
          locale,
        })
      );
      await this.emailService.sendEmail(email, getPromotionSubject(locale), html);
    } catch (error) {
      this.logger.error(`Failed to send promotion notification to ${email}:`, error);
    }

    await this.sendPush(userId, {
      title: t(locale, 'push.promotion.title'),
      body: t(locale, 'push.promotion.body', { event: eventTitle }),
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      url: `/events/${event.id}`,
      tag: `rsvp-${event.id}`,
    });
  }

  async sendDrawPublished(
    email: string,
    name: string,
    event: EventNotificationData,
    locale: Locale,
    userId?: string
  ) {
    const eventTitle = event.title || t(locale, 'emails.defaults.gameNight');
    try {
      const html = await render(
        EventNotificationEmail({
          name,
          eventTitle,
          type: 'draw-published',
          locale,
        })
      );
      await this.emailService.sendEmail(
        email,
        getEventNotificationSubject(locale, 'draw-published', eventTitle),
        html
      );
    } catch (error) {
      this.logger.error(`Failed to send draw published notification to ${email}:`, error);
    }

    await this.sendPush(userId, {
      title: t(locale, 'push.drawPublished.title'),
      body: t(locale, 'push.drawPublished.body', { event: eventTitle }),
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      url: `/events/${event.id}`,
      tag: `draw-${event.id}`,
    });
  }

  async announceEventOpen(recipients: NotificationRecipient[], event: EventNotificationData) {
    const results = await Promise.allSettled(
      recipients.map(async (recipient) => {
        const eventTitle =
          event.title || t(recipient.preferredLanguage, 'emails.defaults.gameNight');
        const html = await render(
          EventNotificationEmail({
            name: t(recipient.preferredLanguage, 'emails.defaults.playerName'),
            eventTitle,
            type: 'event-open',
            locale: recipient.preferredLanguage,
          })
        );
        return this.emailService.sendEmail(
          recipient.email,
          getEventNotificationSubject(recipient.preferredLanguage, 'event-open', eventTitle),
          html
        );
      })
    );

    const failed = results.filter((r) => r.status === 'rejected').length;
    if (failed > 0) {
      this.logger.error(
        `Failed to send event open announcement to ${failed}/${recipients.length} recipients`
      );
    }
    this.logger.log(
      `Event open announcement sent to ${recipients.length - failed}/${recipients.length} recipients`
    );

    // Group recipients by locale so push sends hit the DB once per language
    // (typically 1–2 queries total) instead of once per user — keeps Railway's
    // small Postgres pool from thrashing on large announcements.
    const byLocale = new Map<Locale, string[]>();
    for (const recipient of recipients) {
      const userIds = byLocale.get(recipient.preferredLanguage) ?? [];
      userIds.push(recipient.userId);
      byLocale.set(recipient.preferredLanguage, userIds);
    }

    await Promise.allSettled(
      Array.from(byLocale.entries()).map(([locale, userIds]) => {
        const eventTitle = event.title || t(locale, 'emails.defaults.gameNight');
        return this.pushService.sendToUsers(userIds, {
          title: t(locale, 'push.eventOpen.title'),
          body: t(locale, 'push.eventOpen.body', { event: eventTitle }),
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-96x96.png',
          url: `/events/${event.id}`,
          tag: `event-open-${event.id}`,
        });
      })
    );
  }

  async sendResultsPublished(
    email: string,
    name: string,
    event: EventNotificationData,
    locale: Locale,
    userId?: string
  ) {
    const eventTitle = event.title || t(locale, 'emails.defaults.gameNight');
    try {
      const html = await render(
        EventNotificationEmail({
          name,
          eventTitle,
          type: 'results-published',
          locale,
        })
      );
      await this.emailService.sendEmail(
        email,
        getEventNotificationSubject(locale, 'results-published', eventTitle),
        html
      );
    } catch (error) {
      this.logger.error(`Failed to send results published notification to ${email}:`, error);
    }

    await this.sendPush(userId, {
      title: t(locale, 'push.resultsPublished.title'),
      body: t(locale, 'push.resultsPublished.body', { event: eventTitle }),
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      url: `/events/${event.id}`,
      tag: `results-${event.id}`,
    });
  }
}
