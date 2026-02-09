import { Controller, Post, UseGuards, Get, Req, Body } from "@nestjs/common"
import { AuthService } from "./auth.service"
import type { LoginDto, SignupDto, AuthTokens, ForgotPasswordDto, ResetPasswordDto } from "@padel/types"
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  async signup(@Body() dto: SignupDto): Promise<AuthTokens> {
    return this.authService.signup(dto)
  }

  @Post("login")
  async login(@Body() dto: LoginDto): Promise<AuthTokens> {
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

  @Post("forgot-password")
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto)
  }

  @Post("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto)
  }
}
