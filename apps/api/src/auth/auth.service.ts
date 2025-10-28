import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common"
import type { JwtService } from "@nestjs/jwt"
import type { ConfigService } from "@nestjs/config"
import * as bcrypt from "bcrypt"
import type { PrismaService } from "../prisma/prisma.service"
import type { LoginDto, SignupDto, AuthTokens } from "@padel/types"
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

    return this.generateTokens(user.id, user.email, user.roles)
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

    return this.generateTokens(user.id, user.email, user.roles)
  }

  async refresh(userId: string): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new UnauthorizedException("User not found")
    }

    return this.generateTokens(user.id, user.email, user.roles)
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
      roles: user.roles,
      player: user.player,
    }
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
}
