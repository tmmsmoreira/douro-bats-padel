import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ConfigService } from "@nestjs/config"
import { ExtractJwt, Strategy } from "passport-jwt"

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_REFRESH_SECRET"),
    })
  }

  async validate(payload: any) {
    if (!payload.sub) {
      throw new UnauthorizedException()
    }

    return {
      sub: payload.sub,
      email: payload.email,
      roles: payload.roles,
    }
  }
}
