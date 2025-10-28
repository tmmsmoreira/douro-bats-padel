import type { Role } from "./common"

export interface AuthUser {
  id: string
  email: string
  name: string | null
  roles: Role[]
}

export interface LoginDto {
  email: string
  password: string
}

export interface SignupDto {
  email: string
  password: string
  name?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}
