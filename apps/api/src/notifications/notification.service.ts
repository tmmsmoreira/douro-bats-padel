import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private emailService: EmailService) {}

  async sendRSVPConfirmation(email: string, name: string, event: any) {
    // For now, keep logger.log for backward compatibility
    // TODO: Create proper HTML email template
    this.logger.log(`[EMAIL] RSVP Confirmation to ${email}`);
    this.logger.log(`Hi ${name}, you are confirmed for ${event.title} on ${event.date}`);
  }

  async sendWaitlistNotification(email: string, name: string, event: any, position: number) {
    this.logger.log(`[EMAIL] Waitlist Notification to ${email}`);
    this.logger.log(
      `Hi ${name}, you are on the waitlist at position #${position} for ${event.title}`
    );
    // TODO: Integrate with Postmark
  }

  async sendPromotionNotification(email: string, name: string, event: any) {
    this.logger.log(`[EMAIL] Promotion Notification to ${email}`);
    this.logger.log(`Hi ${name}, you have been promoted from the waitlist for ${event.title}!`);
    // TODO: Integrate with Postmark
  }

  async sendDrawPublished(email: string, name: string, event: any) {
    this.logger.log(`[EMAIL] Draw Published to ${email}`);
    this.logger.log(`Hi ${name}, the draw for ${event.title} has been published!`);
    // TODO: Integrate with Postmark
  }

  async sendResultsPublished(email: string, name: string, event: any) {
    this.logger.log(`[EMAIL] Results Published to ${email}`);
    this.logger.log(`Hi ${name}, results for ${event.title} are now available!`);
    // TODO: Integrate with Postmark
  }

  async announceEventOpen(emails: string[], event: any) {
    this.logger.log(`[EMAIL] Event Open Announcement to ${emails.length} recipients`);
    this.logger.log(`RSVP is now open for ${event.title}!`);
    // TODO: Integrate with Postmark bulk send
  }
}
