import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken: string
    refreshToken: string
    error?: string
    user: {
      id: string
      roles: string[]
      profilePhoto?: string
    } & DefaultSession["user"]
  }

  interface User {
    accessToken?: string
    refreshToken?: string
    roles?: string[]
    profilePhoto?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    roles?: string[]
    profilePhoto?: string
    accessTokenExpires?: number
    error?: string
  }
}
