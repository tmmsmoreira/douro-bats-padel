import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import type {
  LoginDto,
  SignupDto,
  AuthTokens,
  ForgotPasswordDto,
  ResetPasswordDto,
  GoogleAuthDto,
} from '@padel/types';
import { Role } from '@padel/types';
import { EmailService } from '../notifications/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService
  ) {}

  async signup(dto: SignupDto): Promise<{ message: string; token?: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    const emailVerificationExpires = new Date(Date.now() + 86400000); // 24 hours from now

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        roles: [Role.VIEWER],
        emailVerified: false,
        emailVerificationToken,
        emailVerificationExpires,
        player: {
          create: {
            rating: 0,
            status: 'ACTIVE',
          },
        },
      },
      include: {
        player: true,
      },
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        user.name || 'User',
        verificationToken
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't fail registration if email fails
    }

    // For development: return the token
    return {
      message: 'Registration successful! Please check your email to verify your account.',
      token:
        this.configService.get<string>('NODE_ENV') === 'development'
          ? verificationToken
          : undefined,
    };
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    return this.generateTokens(user.id, user.email, user.roles as Role[]);
  }

  async googleAuth(dto: GoogleAuthDto): Promise<AuthTokens> {
    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // If user doesn't exist, create them
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          profilePhoto: dto.profilePhoto,
          roles: [Role.VIEWER],
          emailVerified: true, // Google already verifies emails
          player: {
            create: {
              rating: 0,
              status: 'ACTIVE',
            },
          },
        },
        include: {
          player: true,
        },
      });
    } else {
      // Update profile photo and mark email as verified if provided
      const updateData: any = { emailVerified: true };
      if (dto.profilePhoto && dto.profilePhoto !== user.profilePhoto) {
        updateData.profilePhoto = dto.profilePhoto;
      }

      user = await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }

    return this.generateTokens(user.id, user.email, user.roles as Role[]);
  }

  async refresh(userId: string): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateTokens(user.id, user.email, user.roles as Role[]);
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        player: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      profilePhoto: user.profilePhoto,
      roles: user.roles,
      player: user.player,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string; token?: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Don't reveal if user exists or not for security
    if (!user) {
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour from now

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken,
        resetPasswordExpires,
      },
    });

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(user.email, user.name || 'User', resetToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Don't fail the request if email fails
    }

    return {
      message: 'If the email exists, a password reset link has been sent',
      token: this.configService.get<string>('NODE_ENV') === 'development' ? resetToken : undefined,
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const resetPasswordToken = crypto.createHash('sha256').update(dto.token).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Password has been reset successfully' };
  }

  private async generateTokens(userId: string, email: string, roles: Role[]): Promise<AuthTokens> {
    const payload = { sub: userId, email, roles };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateProfilePhoto(userId: string, profilePhoto: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { profilePhoto },
      include: {
        player: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      profilePhoto: user.profilePhoto,
      roles: user.roles,
      player: user.player,
    };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return { message: 'Email verified successfully! You can now log in.' };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string; token?: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        message: 'If the email exists and is not verified, a verification email has been sent',
      };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    const emailVerificationExpires = new Date(Date.now() + 86400000); // 24 hours from now

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken,
        emailVerificationExpires,
      },
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        user.name || 'User',
        verificationToken
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new BadRequestException('Failed to send verification email');
    }

    // For development: return the token
    return {
      message: 'Verification email sent! Please check your inbox.',
      token:
        this.configService.get<string>('NODE_ENV') === 'development'
          ? verificationToken
          : undefined,
    };
  }
}
