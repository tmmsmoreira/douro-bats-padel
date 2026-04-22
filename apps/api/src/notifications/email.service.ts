import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import { Locale } from '@padel/types';
import VerificationEmail, { getVerificationSubject } from '../emails/verification-email';
import PasswordResetEmail, { getPasswordResetSubject } from '../emails/password-reset-email';
import InvitationEmail, { getInvitationSubject } from '../emails/invitation-email';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn('[EMAIL] RESEND_API_KEY not configured. Email sending will fail.');
    }
    this.resend = new Resend(apiKey);
  }

  async sendEmail(to: string, subject: string, html: string, text?: string) {
    try {
      const from = this.configService.get<string>(
        'EMAIL_FROM',
        'Douro Bats Padel <onboarding@resend.dev>'
      );

      const { data, error } = await this.resend.emails.send({
        from,
        to,
        subject,
        html,
        text,
      });

      if (error) {
        this.logger.error(`[EMAIL] Failed to send email to ${to}:`, error);
        throw error;
      }

      this.logger.log(`[EMAIL] Message sent to ${to}: ${data?.id}`);
      return data;
    } catch (error) {
      this.logger.error(`[EMAIL] Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  async sendVerificationEmail(email: string, name: string, token: string, locale: Locale) {
    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${token}`;

    const html = await render(VerificationEmail({ name, verificationUrl, locale }));

    return this.sendEmail(email, getVerificationSubject(locale), html);
  }

  async sendPasswordResetEmail(email: string, name: string, token: string, locale: Locale) {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;

    const html = await render(PasswordResetEmail({ name, resetUrl, locale }));

    return this.sendEmail(email, getPasswordResetSubject(locale), html);
  }

  async sendInvitationEmail(email: string, token: string, invitedByName: string, locale: Locale) {
    const invitationUrl = `${this.configService.get<string>('FRONTEND_URL')}/register?invitation=${token}`;

    const html = await render(InvitationEmail({ invitationUrl, invitedByName, locale }));

    return this.sendEmail(email, getInvitationSubject(locale), html);
  }
}
