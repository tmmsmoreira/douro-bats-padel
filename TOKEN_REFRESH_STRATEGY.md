# Token Refresh Strategy

## Overview

This document explains how automatic token refresh works in the Douro Bats Padel application to prevent session loss while maintaining security.

## How It Works

### Token Lifecycle

1. **Initial Login**
   - User logs in with email/password or Google OAuth
   - Backend generates two tokens:
     - **Access Token**: Valid for 24 hours (JWT_EXPIRES_IN in `.env`)
     - **Refresh Token**: Valid for 7 days (JWT_REFRESH_EXPIRES_IN in `.env`)
   - Both tokens are stored in the NextAuth session

2. **Active Session**
   - Every time NextAuth checks the session (on page load, API call, etc.), the JWT callback runs
   - The callback checks if the access token is about to expire (within 5 minutes)
   - If still valid, the existing token is returned
   - If expired or about to expire, automatic refresh is triggered

3. **Automatic Refresh**
   - The refresh token is sent to `/auth/refresh` endpoint
   - Backend validates the refresh token and generates new tokens
   - New access token and refresh token are stored in the session
   - User continues working without interruption

4. **Session Expiration**
   - After 7 days of **inactivity**, the refresh token expires
   - User must log in again to get new tokens
   - If user is **active**, tokens are continuously refreshed, extending the session

## Configuration

### Backend (apps/api/.env)

```env
# Access token lifetime (how long before automatic refresh is needed)
JWT_EXPIRES_IN="24h"

# Refresh token lifetime (maximum inactivity period before forced re-login)
JWT_REFRESH_EXPIRES_IN="7d"
```

### Frontend (apps/web/src/lib/auth.ts)

```typescript
// Refresh buffer: refresh 5 minutes before expiration
const REFRESH_BUFFER = 5 * 60 * 1000 // 5 minutes in milliseconds
```

## Security Considerations

### ✅ What This Prevents

1. **Session Loss**: Users don't lose their session while actively using the app
2. **Forced Re-login**: No need to log in every 24 hours if actively using the app
3. **Poor UX**: No sudden logouts in the middle of work

### ✅ What This Maintains

1. **Security**: Inactive sessions expire after 7 days
2. **Token Rotation**: New tokens are issued regularly, reducing risk if compromised
3. **Automatic Cleanup**: Old tokens become invalid after refresh

### ⚠️ Important Notes

- **Refresh tokens are sensitive**: They're stored in the session and never exposed to client-side JavaScript
- **7-day limit**: Even with activity, after 7 days the refresh token expires (can be adjusted in `.env`)
- **Concurrent sessions**: Each login creates independent tokens, so multiple devices work independently

## Error Handling

If token refresh fails (e.g., refresh token expired or invalid):

1. The `error` field is set in the session: `session.error = "RefreshAccessTokenError"`
2. The user can check this error and redirect to login if needed
3. The proxy middleware will catch unauthorized requests and redirect to `/login`

## Testing the Implementation

### Test Scenario 1: Active User (Should NOT be logged out)

1. Log in to the application
2. Use the app normally (browse pages, create events, etc.)
3. Wait 24+ hours while occasionally using the app
4. **Expected**: Session remains active, tokens are automatically refreshed

### Test Scenario 2: Inactive User (Should be logged out)

1. Log in to the application
2. Close the browser and don't use the app for 7+ days
3. Try to access the app again
4. **Expected**: Redirected to login page (refresh token expired)

### Test Scenario 3: Token Refresh (Can be observed in console)

1. Log in to the application
2. Open browser DevTools → Console
3. Wait for the access token to approach expiration (23h 55m after login)
4. **Expected**: Console log: "Access token expired, refreshing..."
5. New tokens are issued automatically

## Implementation Files

- **Frontend Auth Config**: `apps/web/src/lib/auth.ts`
  - `refreshAccessToken()` function
  - JWT callback with expiration check
  - Session callback with error handling

- **Type Definitions**: `apps/web/src/types/next-auth.d.ts`
  - Extended Session interface with `error` field
  - Extended JWT interface with `accessTokenExpires` and `error` fields

- **Backend Refresh Endpoint**: `apps/api/src/auth/auth.controller.ts`
  - `POST /auth/refresh` endpoint
  - Protected by `JwtRefreshGuard`

- **Backend Refresh Strategy**: `apps/api/src/auth/strategies/jwt-refresh.strategy.ts`
  - Validates refresh tokens using `JWT_REFRESH_SECRET`

## Monitoring

To monitor token refresh in production:

1. Check server logs for refresh endpoint calls: `POST /auth/refresh`
2. Monitor for `RefreshAccessTokenError` in application logs
3. Track session duration metrics to ensure users aren't being logged out unexpectedly

## Future Improvements

1. **Sliding Window**: Extend refresh token expiration on each refresh (currently fixed at 7 days)
2. **Token Revocation**: Add ability to revoke specific refresh tokens (e.g., on password change)
3. **Device Management**: Track and manage refresh tokens per device
4. **Rate Limiting**: Prevent abuse of refresh endpoint

