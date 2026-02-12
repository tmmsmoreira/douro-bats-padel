import { Controller, Post, UseGuards, Get, Req, Body, Patch } from "@nestjs/common"
import { AuthService } from "./auth.service"
import type { LoginDto, SignupDto, AuthTokens, ForgotPasswordDto, ResetPasswordDto, GoogleAuthDto } from "@padel/types"
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto)
  }

  @Post("login")
  async login(@Body() dto: LoginDto): Promise<AuthTokens> {
    return this.authService.login(dto)
  }

  @Post("google")
  async googleAuth(@Body() dto: GoogleAuthDto): Promise<AuthTokens> {
    return this.authService.googleAuth(dto)
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

  @UseGuards(JwtAuthGuard)
  @Patch("profile-photo")
  async updateProfilePhoto(@Req() req: any, @Body() body: { profilePhoto: string }) {
    return this.authService.updateProfilePhoto(req.user.sub, body.profilePhoto)
  }

  @Post("verify-email")
  async verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body.token)
  }

  @Post("resend-verification")
  async resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerificationEmail(body.email)
  }
}
