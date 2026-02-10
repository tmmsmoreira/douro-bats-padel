import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import type { AuthTokens, AuthUser } from "@padel/types"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!res.ok) return null

          const tokens: AuthTokens = await res.json()

          // Fetch user profile
          const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
          })

          if (!userRes.ok) return null

          const user: AuthUser = await userRes.json()

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            profilePhoto: user.profilePhoto,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            roles: user.roles,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign-in
      if (account?.provider === "google" && profile?.email) {
        try {
          // Try to get or create user in backend and get JWT tokens
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: profile.email,
              name: profile.name,
              profilePhoto: profile.picture,
            }),
          })

          if (!res.ok) {
            console.error("Failed to authenticate with backend:", await res.text())
            return false
          }

          const tokens: AuthTokens = await res.json()

          // Fetch user profile to get roles
          const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
          })

          if (!userRes.ok) {
            console.error("Failed to fetch user profile:", await userRes.text())
            return false
          }

          const backendUser: AuthUser = await userRes.json()

          // Store tokens and roles in the user object so they can be accessed in jwt callback
          user.accessToken = tokens.accessToken
          user.refreshToken = tokens.refreshToken
          user.roles = backendUser.roles
          user.id = backendUser.id

          return true
        } catch (error) {
          console.error("Google auth error:", error)
          return false
        }
      }

      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.roles = user.roles
        token.profilePhoto = user.profilePhoto
        // For Google OAuth, use the backend user ID
        if (account?.provider === "google") {
          token.sub = user.id
        }
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.sub!
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      session.user.roles = token.roles as string[]
      session.user.profilePhoto = token.profilePhoto as string | undefined
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
})
