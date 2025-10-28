import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import type { AuthTokens } from "@padel/types"

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

          const user = await userRes.json()

          return {
            id: user.id,
            email: user.email,
            name: user.name,
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
    async jwt({ token, user, account }) {
      if (user) {
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.roles = user.roles
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.sub!
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      session.user.roles = token.roles as string[]
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
