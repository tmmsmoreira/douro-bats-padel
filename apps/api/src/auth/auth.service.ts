import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import * as bcrypt from "bcrypt"
import * as crypto from "crypto"
import { PrismaService } from "../prisma/prisma.service"
import type { LoginDto, SignupDto, AuthTokens, ForgotPasswordDto, ResetPasswordDto } from "@padel/types"
import { Role } from "@padel/types"

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthTokens> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (existingUser) {
      throw new ConflictException("Email already registered")
    }

    const passwordHash = await bcrypt.hash(dto.password, 10)

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        roles: [Role.VIEWER],
        player: {
          create: {
            rating: 0,
            tier: "EXPLORERS",
            status: "ACTIVE",
          },
        },
      },
      include: {
        player: true,
      },
    })

    return this.generateTokens(user.id, user.email, user.roles as Role[])
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid credentials")
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash)

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials")
    }

    return this.generateTokens(user.id, user.email, user.roles as Role[])
  }

  async refresh(userId: string): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new UnauthorizedException("User not found")
    }

    return this.generateTokens(user.id, user.email, user.roles as Role[])
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        player: true,
      },
    })

    if (!user) {
      throw new UnauthorizedException("User not found")
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      profilePhoto: user.profilePhoto,
      roles: user.roles,
      player: user.player,
    }
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string; token?: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    // Don't reveal if user exists or not for security
    if (!user) {
      return { message: "If the email exists, a password reset link has been sent" }
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    const resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour from now

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken,
        resetPasswordExpires,
      },
    })

    // In production, send email with reset link
    // For now, return the token for testing purposes
    console.log(`Password reset token for ${dto.email}: ${resetToken}`)

    return {
      message: "If the email exists, a password reset link has been sent",
      token: resetToken, // Remove this in production
    }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const resetPasswordToken = crypto.createHash("sha256").update(dto.token).digest("hex")

    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      throw new BadRequestException("Invalid or expired reset token")
    }

    const passwordHash = await bcrypt.hash(dto.password, 10)

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    })

    return { message: "Password has been reset successfully" }
  }

  private async generateTokens(userId: string, email: string, roles: Role[]): Promise<AuthTokens> {
    const payload = { sub: userId, email, roles }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRES_IN", "7d"),
      }),
    ])

    return {
      accessToken,
      refreshToken,
    }
  }

  async updateProfilePhoto(userId: string, profilePhoto: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { profilePhoto },
      include: {
        player: true,
      },
    })

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      profilePhoto: user.profilePhoto,
      roles: user.roles,
      player: user.player,
    }
  }
}
