import type { Role, PlayerStatus } from './common';

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  dateOfBirth?: Date | null;
  phoneNumber?: string | null;
  profilePhoto?: string | null;
  roles: Role[];
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Player profile entity
 */
export interface PlayerProfile {
  id: string;
  userId: string;
  user?: User;
  rating: number;
  status: PlayerStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Player with user information (commonly used in UI)
 */
export interface Player {
  id: string;
  name: string;
  email: string;
  rating: number;
  tier?: string;
  profilePhoto?: string | null;
  status?: PlayerStatus;
  invitation?: any; // Will be typed with Invitation from auth.ts
}

/**
 * Waitlisted player with position
 */
export interface WaitlistedPlayer extends Player {
  position: number;
}
