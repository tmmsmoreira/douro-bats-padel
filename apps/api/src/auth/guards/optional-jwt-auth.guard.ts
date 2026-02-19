import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // For public endpoints, try to validate the token if present, but don't fail if invalid
      try {
        await super.canActivate(context);
      } catch {
        // Ignore authentication errors for public endpoints
        // The request will proceed without user context
      }
      return true;
    }

    // For protected endpoints, enforce authentication
    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If the endpoint is public, allow the request even with an invalid token
    // This allows both authenticated and unauthenticated users to access public endpoints
    if (isPublic) {
      // Return user if valid, null if not - don't throw errors for public endpoints
      return user || null;
    }

    // For protected endpoints, throw error if no user or if there's an error
    if (err || !user) {
      throw err || new Error('Unauthorized');
    }

    return user;
  }
}
