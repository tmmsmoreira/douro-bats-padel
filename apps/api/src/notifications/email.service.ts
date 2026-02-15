import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Resend } from "resend"

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

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
            <h1 style="color: #2563eb; margin-top: 0;">Welcome to Douro Bats Padel!</h1>
            <p>Hi ${name},</p>
            <p>Thank you for registering! Please verify your email address to complete your registration and start enjoying all the features.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email Address</a>
            </div>
            <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="color: #2563eb; word-break: break-all; font-size: 14px;">${verificationUrl}</p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">This link will expire in 24 hours.</p>
            <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
          </div>
          <div style="text-align: center; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Douro Bats Padel. All rights reserved.</p>
          </div>
        </body>
      </html>
    `

    const text = `
      Welcome to Douro Bats Padel!

      Hi ${name},

      Thank you for registering! Please verify your email address by clicking the link below:

      ${verificationUrl}

      This link will expire in 24 hours.

      If you didn't create an account, you can safely ignore this email.

      © ${new Date().getFullYear()} Douro Bats Padel. All rights reserved.
    `

    return this.sendEmail(email, "Verify Your Email - Douro Bats Padel", html, text)
  }

  async sendPasswordResetEmail(email: string, name: string, token: string) {
    const resetUrl = `${this.configService.get<string>("FRONTEND_URL")}/reset-password?token=${token}`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
            <h1 style="color: #2563eb; margin-top: 0;">Reset Your Password</h1>
            <p>Hi ${name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="color: #2563eb; word-break: break-all; font-size: 14px;">${resetUrl}</p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">This link will expire in 1 hour.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
          <div style="text-align: center; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Douro Bats Padel. All rights reserved.</p>
          </div>
        </body>
      </html>
    `

    const text = `
      Reset Your Password

      Hi ${name},

      We received a request to reset your password. Click the link below to create a new password:

      ${resetUrl}

      This link will expire in 1 hour.

      If you didn't request a password reset, you can safely ignore this email.

      © ${new Date().getFullYear()} Douro Bats Padel. All rights reserved.
    `

    return this.sendEmail(email, "Reset Your Password - Douro Bats Padel", html, text)
  }
}

