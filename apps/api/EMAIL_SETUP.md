# Email Verification Setup Guide

This guide will help you configure email verification for the Padel Manager application.

## ✅ Completed Steps

1. ✅ Database schema updated with email verification fields
2. ✅ Database migration applied successfully
3. ✅ 23 existing users marked as verified
4. ✅ Email service implemented with Nodemailer
5. ✅ Frontend pages created for verification flow

## 🔧 SMTP Configuration Required

You need to configure SMTP settings in `apps/api/.env` to send actual emails.

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password

3. **Update `.env` file**:
   ```env
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_SECURE="false"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-16-char-app-password"
   SMTP_FROM="Padel Manager <noreply@padelmanager.com>"
   ```

### Option 2: Other SMTP Providers

#### SendGrid
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
SMTP_FROM="Padel Manager <noreply@yourdomain.com>"
```

#### Mailgun
```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="postmaster@your-domain.mailgun.org"
SMTP_PASS="your-mailgun-password"
SMTP_FROM="Padel Manager <noreply@yourdomain.com>"
```

#### AWS SES
```env
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-ses-smtp-username"
SMTP_PASS="your-ses-smtp-password"
SMTP_FROM="Padel Manager <noreply@yourdomain.com>"
```

## 🧪 Testing Email Verification

### Development Mode Testing

In development mode (`NODE_ENV=development`), the API returns verification tokens in the response, so you can test without actual email delivery:

1. **Register a new user** at http://localhost:3000/register
2. **Copy the verification token** shown on the success page
3. **Click the verification link** or manually visit `/verify-email?token=<token>`
4. **Try to login** - should work after verification

### Production Testing

1. **Update SMTP credentials** in `.env`
2. **Restart the API server**
3. **Register with a real email address**
4. **Check your inbox** for the verification email
5. **Click the verification link**
6. **Login successfully**

## 📧 Email Flow

1. **User registers** → Verification email sent
2. **User clicks link** → Email verified in database
3. **User logs in** → Allowed only if email is verified
4. **Forgot verification?** → Can resend at `/resend-verification`

## 🔒 Security Features

- Verification tokens are hashed (SHA-256) before storing
- Tokens expire after 24 hours
- Password reset tokens expire after 1 hour
- Google OAuth users are automatically verified
- API doesn't reveal if email exists (security best practice)

## 🚀 Restart API Server

After updating SMTP configuration, restart the API server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd apps/api
pnpm dev
```

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` (TLS) or `465` (SSL) |
| `SMTP_SECURE` | Use SSL/TLS | `false` for port 587, `true` for 465 |
| `SMTP_USER` | SMTP username/email | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP password | App password or API key |
| `SMTP_FROM` | From address | `"App Name <noreply@domain.com>"` |
| `FRONTEND_URL` | Frontend URL | `http://localhost:3000` |
| `NODE_ENV` | Environment | `development` or `production` |

## ❓ Troubleshooting

### Emails not sending?

1. Check SMTP credentials are correct
2. Check firewall/network allows SMTP connections
3. Check API server logs for error messages
4. Try using Gmail with App Password first
5. Verify `NODE_ENV` is set correctly

### "Invalid credentials" error?

- For Gmail: Make sure you're using an App Password, not your regular password
- Check username/password have no extra spaces
- Verify 2FA is enabled for Gmail

### Verification link not working?

- Check token hasn't expired (24 hours)
- Verify `FRONTEND_URL` is correct in `.env`
- Check browser console for errors

## 🎉 You're All Set!

The email verification system is now fully configured and ready to use!

