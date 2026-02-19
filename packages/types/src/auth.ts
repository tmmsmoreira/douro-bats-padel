import type { Role } from './common';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  roles: Role[];
  profilePhoto?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface SignupDto {
  email: string;
  password: string;
  name?: string;
  invitationToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Invitation types
export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

export interface Invitation {
  id: string;
  email: string;
  token: string;
  status: InvitationStatus;
  invitedBy: string;
  invitedByUser?: {
    id: string;
    name: string | null;
    email: string;
  };
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvitationDto {
  email: string;
  expiresInDays?: number; // Default: 7 days
}

export interface ValidateInvitationDto {
  token: string;
}

export interface InvitationValidationResponse {
  valid: boolean;
  email?: string;
  message?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface GoogleAuthDto {
  email: string;
  name?: string | null;
  profilePhoto?: string | null;
  invitationToken?: string;
}
