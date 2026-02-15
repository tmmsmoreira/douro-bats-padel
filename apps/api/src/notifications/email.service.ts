import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Resend } from "resend"
import { render } from "@react-email/components"
import VerificationEmail from "../../emails/verification-email"
import PasswordResetEmail from "../../emails/password-reset-email"

@Injectable()
export class EmailService {
  private resend: Resend

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("RESEND_API_KEY")
    if (!apiKey) {
      console.warn("[EMAIL] RESEND_API_KEY not configured. Email sending will fail.")
    }
    this.resend = new Resend(apiKey)
  }

  async sendEmail(to: string, subject: string, html: string, text?: string) {
    try {
      const from = this.configService.get<string>("EMAIL_FROM", "Douro Bats Padel <onboarding@resend.dev>")

      const { data, error } = await this.resend.emails.send({
        from,
        to,
        subject,
        html,
        text,
      })

      if (error) {
        console.error(`[EMAIL] Failed to send email to ${to}:`, error)
        throw error
      }

      console.log(`[EMAIL] Message sent to ${to}: ${data?.id}`)
      return data
    } catch (error) {
      console.error(`[EMAIL] Failed to send email to ${to}:`, error)
      throw error
    }
  }

  async sendVerificationEmail(email: string, name: string, token: string) {
    const verificationUrl = `${this.configService.get<string>("FRONTEND_URL")}/verify-email?token=${token}`

    const html = await render(VerificationEmail({ name, verificationUrl }))

    return this.sendEmail(email, "Verify Your Email - Douro Bats Padel", html)
  }

  async sendPasswordResetEmail(email: string, name: string, token: string) {
    const resetUrl = `${this.configService.get<string>("FRONTEND_URL")}/reset-password?token=${token}`

    const html = await render(PasswordResetEmail({ name, resetUrl }))

    return this.sendEmail(email, "Reset Your Password - Douro Bats Padel", html)
  }
}

