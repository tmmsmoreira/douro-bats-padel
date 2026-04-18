import { Injectable, Logger } from '@nestjs/common';
import { render } from '@react-email/components';
import { EmailService } from './email.service';
import { PushService } from '../push/push.service';
import type { PushPayload } from '../push/push.service';
import RSVPConfirmationEmail from '../emails/rsvp-confirmation-email';
import WaitlistNotificationEmail from '../emails/waitlist-notification-email';
import PromotionNotificationEmail from '../emails/promotion-notification-email';
import EventNotificationEmail from '../emails/event-notification-email';

export interface EventNotificationData {
  id: string;
  title?: string | null;
  date: Date | string;
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
    userId?: string
  ) {
    try {
      const eventDate =
        event.date instanceof Date ? event.date.toLocaleDateString() : String(event.date);
      const html = await render(
        RSVPConfirmationEmail({
          name,
          eventTitle: event.title || 'Game Night',
          eventDate,
        })
      );
      await this.emailService.sendEmail(
        email,
        `You're confirmed for ${event.title || 'Game Night'} - Douro Bats Padel`,
        html
      );
    } catch (error) {
      this.logger.error(`Failed to send RSVP confirmation to ${email}:`, error);
    }

    await this.sendPush(userId, {
      title: "You're confirmed!",
      body: `You're in for ${event.title || 'Game Night'}`,
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
    userId?: string
  ) {
    try {
      const html = await render(
        WaitlistNotificationEmail({
          name,
          eventTitle: event.title || 'Game Night',
          position,
        })
      );
      await this.emailService.sendEmail(
        email,
        `Waitlisted for ${event.title || 'Game Night'} - Douro Bats Padel`,
        html
      );
    } catch (error) {
      this.logger.error(`Failed to send waitlist notification to ${email}:`, error);
    }

    await this.sendPush(userId, {
      title: 'Waitlisted',
      body: `Position #${position} for ${event.title || 'Game Night'}`,
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
    userId?: string
  ) {
    try {
      const html = await render(
        PromotionNotificationEmail({
          name,
          eventTitle: event.title || 'Game Night',
        })
      );
      await this.emailService.sendEmail(
        email,
        `You're in! Promoted from waitlist - Douro Bats Padel`,
        html
      );
    } catch (error) {
      this.logger.error(`Failed to send promotion notification to ${email}:`, error);
    }

    await this.sendPush(userId, {
      title: "You're in!",
      body: `Promoted from waitlist for ${event.title || 'Game Night'}`,
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
    userId?: string
  ) {
    try {
      const html = await render(
        EventNotificationEmail({
          name,
          eventTitle: event.title || 'Game Night',
          type: 'draw-published',
        })
      );
      await this.emailService.sendEmail(
        email,
        `Draw published for ${event.title || 'Game Night'} - Douro Bats Padel`,
        html
      );
    } catch (error) {
      this.logger.error(`Failed to send draw published notification to ${email}:`, error);
    }

    await this.sendPush(userId, {
      title: 'Draw is out!',
      body: `Check your matches for ${event.title || 'Game Night'}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      url: `/events/${event.id}`,
      tag: `draw-${event.id}`,
    });
  }

  async sendResultsPublished(
    email: string,
    name: string,
    event: EventNotificationData,
    userId?: string
  ) {
    try {
      const html = await render(
        EventNotificationEmail({
          name,
          eventTitle: event.title || 'Game Night',
          type: 'results-published',
        })
      );
      await this.emailService.sendEmail(
        email,
        `Results available for ${event.title || 'Game Night'} - Douro Bats Padel`,
        html
      );
    } catch (error) {
      this.logger.error(`Failed to send results published notification to ${email}:`, error);
    }

    await this.sendPush(userId, {
      title: 'Results are in!',
      body: `See your scores for ${event.title || 'Game Night'}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      url: `/events/${event.id}`,
      tag: `results-${event.id}`,
    });
  }

  async announceEventOpen(
    recipients: { email: string; userId: string }[],
    event: EventNotificationData
  ) {
    const results = await Promise.allSettled(
      recipients.map(async (recipient) => {
        const html = await render(
          EventNotificationEmail({
            name: 'Player',
            eventTitle: event.title || 'Game Night',
            type: 'event-open',
          })
        );
        return this.emailService.sendEmail(
          recipient.email,
          `RSVP now open for ${event.title || 'Game Night'} - Douro Bats Padel`,
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

    // Send push to all recipients
    const userIds = recipients.map((r) => r.userId);
    try {
      await this.pushService.sendToUsers(userIds, {
        title: 'RSVP Now Open',
        body: `${event.title || 'Game Night'} is now open`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        url: `/events/${event.id}`,
        tag: `event-open-${event.id}`,
      });
    } catch (error) {
      this.logger.error('Failed to send push for event open announcement:', error);
    }
  }
}
