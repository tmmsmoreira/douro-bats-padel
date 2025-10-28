import { Controller, Post, UseGuards, Get, Req } from "@nestjs/common"
import type { AuthService } from "./auth.service"
import type { LoginDto, SignupDto, AuthTokens } from "@padel/types"
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  async signup(dto: SignupDto): Promise<AuthTokens> {
    return this.authService.signup(dto)
  }

  @Post("login")
  async login(dto: LoginDto): Promise<AuthTokens> {
    return this.authService.login(dto)
  }

  @UseGuards(JwtRefreshGuard)
  @Post("refresh")
  async refresh(@Req() req: any): Promise<AuthTokens> {
    return this.authService.refresh(req.user.sub)
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getProfile(@Req() req: any) {
    return this.authService.validateUser(req.user.sub)
  }
}
