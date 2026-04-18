import { Controller, Post, UseGuards, Get, Req, Body, Patch } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import type {
  LoginDto,
  SignupDto,
  AuthTokens,
  ForgotPasswordDto,
  ResetPasswordDto,
  GoogleAuthDto,
} from '@padel/types';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { RequestWithUser } from './types';
import {
  ResendVerificationDto,
  UpdateProfileDto,
  UpdateProfilePhotoDto,
  VerifyEmailDto,
} from './dto/profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthTokens> {
    return this.authService.login(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('google')
  async googleAuth(@Body() dto: GoogleAuthDto): Promise<AuthTokens> {
    return this.authService.googleAuth(dto);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Req() req: RequestWithUser): Promise<AuthTokens> {
    return this.authService.refresh(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: RequestWithUser) {
    return this.authService.validateUser(req.user.sub);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile-photo')
  async updateProfilePhoto(@Req() req: RequestWithUser, @Body() dto: UpdateProfilePhotoDto) {
    return this.authService.updateProfilePhoto(req.user.sub, dto.profilePhoto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Req() req: RequestWithUser, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.sub, dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @Post('resend-verification')
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(dto.email);
  }
}
