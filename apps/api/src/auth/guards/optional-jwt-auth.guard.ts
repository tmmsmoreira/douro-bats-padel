import { Injectable, ExecutionContext } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { AuthGuard } from "@nestjs/passport"
import { IS_PUBLIC_KEY } from "../decorators/public.decorator"

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    return super.canActivate(context)
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    // If the endpoint is public, allow the request even without a valid token
    if (isPublic) {
      return user || null
    }

    // For protected endpoints, throw error if no user
    if (err || !user) {
      throw err || new Error("Unauthorized")
    }

    return user
  }
}

