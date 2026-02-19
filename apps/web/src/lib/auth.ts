import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import type { AuthTokens, AuthUser } from '@padel/types';
import type { JWT } from 'next-auth/jwt';

/**
 * Token refresh strategy:
 * - Access tokens expire after 24 hours (configured in API .env)
 * - We refresh 5 minutes before expiration to avoid edge cases
 * - Refresh tokens are valid for 7 days (configured in API .env)
 * - After 7 days of inactivity, user must log in again
 * - If user is active, tokens are automatically refreshed
 */

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(token: JWT) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.refreshToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to refresh token: ${response.status} - ${errorText}`);
      // Don't throw - return error state instead so JWT callback can handle it
      return {
        ...token,
        error: 'RefreshAccessTokenError',
      };
    }

    const tokens: AuthTokens = await response.json();

    return {
      ...token,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      // Set expiration time: current time + token lifetime (24h in ms)
      // We subtract 5 minutes as a buffer to refresh before actual expiration
      accessTokenExpires: Date.now() + 24 * 60 * 60 * 1000 - 5 * 60 * 1000,
      error: undefined,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) return null;

          const tokens: AuthTokens = await res.json();

          // Fetch user profile
          const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
          });

          if (!userRes.ok) return null;

          const user: AuthUser = await userRes.json();

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            profilePhoto: user.profilePhoto,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            roles: user.roles,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign-in
      if (account?.provider === 'google' && profile?.email) {
        try {
          // Try to get or create user in backend and get JWT tokens
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: profile.email,
              name: profile.name,
              profilePhoto: profile.picture,
            }),
          });

          if (!res.ok) {
            console.error('Failed to authenticate with backend:', await res.text());
            return false;
          }

          const tokens: AuthTokens = await res.json();

          // Fetch user profile to get roles
          const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
          });

          if (!userRes.ok) {
            console.error('Failed to fetch user profile:', await userRes.text());
            return false;
          }

          const backendUser: AuthUser = await userRes.json();

          // Store tokens, roles, and profile photo in the user object so they can be accessed in jwt callback
          user.accessToken = tokens.accessToken;
          user.refreshToken = tokens.refreshToken;
          user.roles = backendUser.roles;
          user.profilePhoto = backendUser.profilePhoto;
          user.id = backendUser.id;

          return true;
        } catch (error) {
          console.error('Google auth error:', error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in - store tokens and set expiration
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.roles = user.roles;
        token.profilePhoto = user.profilePhoto;
        // Set expiration time: current time + token lifetime (24h in ms)
        // We subtract 5 minutes as a buffer to refresh before actual expiration
        token.accessTokenExpires = Date.now() + 24 * 60 * 60 * 1000 - 5 * 60 * 1000;
        // For Google OAuth, use the backend user ID
        if (account?.provider === 'google') {
          token.sub = user.id;
        }
        return token;
      }

      // If there's a refresh error, return null to clear the session
      if (token.error === 'RefreshAccessTokenError') {
        return null;
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired (or is about to), try to refresh it
      console.log('Access token expired, refreshing...');
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.user.roles = token.roles as string[];
      session.user.profilePhoto = token.profilePhoto as string | undefined;

      // Pass error to the client so we can handle it (e.g., force logout)
      if (token.error) {
        session.error = token.error as string;
      }

      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});
