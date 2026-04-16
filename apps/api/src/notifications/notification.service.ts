import { Injectable, Logger } from '@nestjs/common';
import { render } from '@react-email/components';
import { EmailService } from './email.service';
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

  constructor(private emailService: EmailService) {}

  async sendRSVPConfirmation(email: string, name: string, event: EventNotificationData) {
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
  }

  async sendWaitlistNotification(
    email: string,
    name: string,
    event: EventNotificationData,
    position: number
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
  }

  async sendPromotionNotification(email: string, name: string, event: EventNotificationData) {
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
  }

  async sendDrawPublished(email: string, name: string, event: EventNotificationData) {
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
  }

  async sendResultsPublished(email: string, name: string, event: EventNotificationData) {
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
  }

  async announceEventOpen(emails: string[], event: EventNotificationData) {
    const results = await Promise.allSettled(
      emails.map(async (email) => {
        const html = await render(
          EventNotificationEmail({
            name: 'Player',
            eventTitle: event.title || 'Game Night',
            type: 'event-open',
          })
        );
        return this.emailService.sendEmail(
          email,
          `RSVP now open for ${event.title || 'Game Night'} - Douro Bats Padel`,
          html
        );
      })
    );

    const failed = results.filter((r) => r.status === 'rejected').length;
    if (failed > 0) {
      this.logger.error(
        `Failed to send event open announcement to ${failed}/${emails.length} recipients`
      );
    }
    this.logger.log(
      `Event open announcement sent to ${emails.length - failed}/${emails.length} recipients`
    );
  }
}
