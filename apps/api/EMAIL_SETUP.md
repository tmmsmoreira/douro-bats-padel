# Email Verification Setup Guide

This guide will help you configure email verification for the Padel Manager application.

## ✅ Completed Steps

1. ✅ Database schema updated with email verification fields
2. ✅ Database migration applied successfully
3. ✅ 23 existing users marked as verified
4. ✅ Email service implemented with Resend
5. ✅ Frontend pages created for verification flow

## 🔧 Resend Configuration (Recommended)

The application now uses **Resend** for email delivery - a modern, developer-friendly email API.

### Setup Resend (5 minutes)

1. **Sign up at https://resend.com** (free tier: 3,000 emails/month, 100/day)
2. **Get your API key**:
   - Go to API Keys in the dashboard
   - Click "Create API Key"
   - Copy the key (starts with `re_`)

3. **Add to `.env` file** (local) or **Railway environment variables** (production):
   ```env
   RESEND_API_KEY="re_your_api_key_here"
   EMAIL_FROM="Douro Bats Padel <onboarding@resend.dev>"
   ```

4. **Optional: Use your own domain**:
   - Verify your domain in Resend dashboard
   - Update `EMAIL_FROM` to use your domain:
   ```env
   EMAIL_FROM="Douro Bats Padel <noreply@yourdomain.com>"
   ```

### Why Resend?

- ✅ **3,000 free emails/month** (100/day)
- ✅ **No credit card required**
- ✅ **Excellent deliverability**
- ✅ **Simple API** (no SMTP configuration needed)
- ✅ **Great developer experience**

## 🧪 Testing Email Verification

### Local Development Testing

In development mode, the verification token is returned in the API response for easy testing:

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
| `RESEND_API_KEY` | Resend API key | `re_123abc...` |
| `EMAIL_FROM` | From address | `"Douro Bats Padel <onboarding@resend.dev>"` |
| `FRONTEND_URL` | Frontend URL for email links | `http://localhost:3000` or `https://yourdomain.com` |
| `NODE_ENV` | Environment | `development` or `production` |

## ❓ Troubleshooting

### Emails not sending?

1. **Check Resend API key is set**: Verify `RESEND_API_KEY` in Railway environment variables
2. **Check API server logs**: Look for `[EMAIL]` messages in Railway logs
3. **Verify email domain**: If using custom domain, make sure it's verified in Resend
4. **Check Resend dashboard**: View email logs at https://resend.com/emails

### "Invalid API key" error?

- Make sure you copied the full API key (starts with `re_`)
- Check there are no extra spaces in the environment variable
- Verify the API key is active in Resend dashboard

### Verification link not working?

- Check token hasn't expired (24 hours)
- Verify `FRONTEND_URL` is correct in environment variables
- Check browser console for errors

## 🎉 You're All Set!

The email verification system is now fully configured and ready to use!

