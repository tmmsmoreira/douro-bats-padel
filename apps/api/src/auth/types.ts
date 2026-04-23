import type { Request } from 'express';
import type { Role } from '@padel/types';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: Role[];
  /**
   * Token version at issue time. Matched against the user's current
   * `tokenVersion` on refresh so a bump (e.g. after password reset) revokes
   * every previously-issued refresh token.
   */
  tv: number;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}

/**
 * Request where user may or may not be authenticated (for OptionalJwtAuthGuard / @Public() routes)
 */
export interface RequestWithOptionalUser extends Request {
  user?: JwtPayload;
}
