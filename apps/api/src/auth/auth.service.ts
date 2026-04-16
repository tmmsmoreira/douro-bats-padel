import {
  Injectable,
  Logger,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
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
import { InvitationsService } from '../invitations/invitations.service';

const BCRYPT_SALT_ROUNDS = 10;
const VERIFICATION_TOKEN_TTL_MS = 86400000; // 24 hours
const RESET_TOKEN_TTL_MS = 3600000; // 1 hour

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    @Inject(forwardRef(() => InvitationsService))
    private invitationsService: InvitationsService
  ) {}

  async signup(dto: SignupDto): Promise<{ message: string }> {
    // Validate invitation token
    if (!dto.invitationToken) {
      throw new BadRequestException('Invitation token is required');
    }

    const invitationValidation = await this.invitationsService.validate(dto.invitationToken);

    if (!invitationValidation.valid) {
      throw new BadRequestException(invitationValidation.message || 'Invalid invitation');
    }

    // Verify email matches invitation
    if (invitationValidation.email !== dto.email) {
      throw new BadRequestException('Email does not match the invitation');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    const emailVerificationExpires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS); // 24 hours from now

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

    // Mark invitation as used
    try {
      await this.invitationsService.markAsUsed(dto.invitationToken);
    } catch (error) {
      this.logger.error('Failed to mark invitation as used:', error);
      // Don't fail registration if this fails
    }

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        user.name || 'User',
        verificationToken
      );
    } catch (error) {
      this.logger.error('Failed to send verification email:', error);
      // Don't fail registration if email fails
    }

    return {
      message: 'Registration successful! Please check your email to verify your account.',
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
      // Validate invitation token for new users
      if (!dto.invitationToken) {
        throw new BadRequestException('Invitation token is required for new users');
      }

      const invitationValidation = await this.invitationsService.validate(dto.invitationToken);

      if (!invitationValidation.valid) {
        throw new BadRequestException(invitationValidation.message || 'Invalid invitation');
      }

      // Verify email matches invitation
      if (invitationValidation.email !== dto.email) {
        throw new BadRequestException('Email does not match the invitation');
      }

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

      // Mark invitation as used
      try {
        await this.invitationsService.markAsUsed(dto.invitationToken);
      } catch (error) {
        this.logger.error('Failed to mark invitation as used:', error);
        // Don't fail registration if this fails
      }
    } else {
      // For existing users, only update profile photo
      // Do NOT auto-verify email if they signed up with credentials
      const updateData: { profilePhoto?: string } = {};
      if (dto.profilePhoto && dto.profilePhoto !== user.profilePhoto) {
        updateData.profilePhoto = dto.profilePhoto;
      }

      user = await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      // Check if email is verified for existing users
      if (!user.emailVerified) {
        throw new UnauthorizedException(
          'Please verify your email before logging in. Check your inbox for the verification link.'
        );
      }
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
      dateOfBirth: user.dateOfBirth,
      phoneNumber: user.phoneNumber,
      profilePhoto: user.profilePhoto,
      roles: user.roles,
      player: user.player,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
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
    const resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS); // 1 hour from now

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
      this.logger.error('Failed to send password reset email:', error);
      // Don't fail the request if email fails
    }

    return {
      message: 'If the email exists, a password reset link has been sent',
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

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

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
    const payload = { sub: userId, email, roles, iss: 'padel-api', aud: 'padel-app' };

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

  private validateProfilePhotoUrl(url: string): void {
    if (url.length > 2048) {
      throw new BadRequestException('Profile photo URL is too long (max 2048 characters)');
    }

    try {
      const parsed = new URL(url);
      const isDev = this.configService.get<string>('NODE_ENV') === 'development';
      const allowedProtocols = isDev ? ['https:', 'http:'] : ['https:'];
      if (!allowedProtocols.includes(parsed.protocol)) {
        throw new BadRequestException('Profile photo URL must use HTTPS');
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Profile photo URL is not a valid URL');
    }
  }

  async updateProfilePhoto(userId: string, profilePhoto: string) {
    this.validateProfilePhotoUrl(profilePhoto);

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

  async updateProfile(
    userId: string,
    data: {
      name?: string;
      dateOfBirth?: string;
      phoneNumber?: string;
      profilePhoto?: string;
    }
  ) {
    if (data.profilePhoto) {
      this.validateProfilePhotoUrl(data.profilePhoto);
    }

    const updateData: {
      name?: string;
      phoneNumber?: string;
      profilePhoto?: string;
      dateOfBirth?: Date | null;
    } = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
    if (data.profilePhoto !== undefined) updateData.profilePhoto = data.profilePhoto;
    if (data.dateOfBirth !== undefined) {
      updateData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
    }

    let user;
    try {
      user = await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: {
          player: true,
        },
      });
    } catch (error: unknown) {
      const prismaError = error as { code?: string; meta?: { target?: string[] } };
      if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('phoneNumber')) {
        throw new ConflictException('Phone number already in use');
      }
      throw error;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      dateOfBirth: user.dateOfBirth,
      phoneNumber: user.phoneNumber,
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

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
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
    const emailVerificationExpires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS); // 24 hours from now

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
      this.logger.error('Failed to send verification email:', error);
      throw new BadRequestException('Failed to send verification email');
    }

    return {
      message: 'Verification email sent! Please check your inbox.',
    };
  }
}
