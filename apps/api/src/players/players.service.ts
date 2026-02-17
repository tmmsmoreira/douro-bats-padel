import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { Role } from "@padel/types"

@Injectable()
export class PlayersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      where: {
        player: {
          isNot: null,
        },
      },
      include: {
        player: true,
      },
      orderBy: {
        player: {
          rating: "desc",
        },
      },
    })

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      profilePhoto: user.profilePhoto,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      player: user.player
        ? {
            id: user.player.id,
            rating: user.player.rating,
            status: user.player.status,
            createdAt: user.player.createdAt,
          }
        : null,
    }))
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        player: {
          include: {
            weeklyScores: {
              orderBy: {
                createdAt: "desc",
              },
              take: 10,
            },
            rankingSnapshots: {
              orderBy: {
                createdAt: "desc",
              },
              take: 10,
            },
          },
        },
      },
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      profilePhoto: user.profilePhoto,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      roles: user.roles,
      player: user.player,
    }
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    // Safeguard: Prevent deletion of admin users
    if (user.roles && user.roles.includes(Role.ADMIN)) {
      throw new BadRequestException("Cannot delete admin users")
    }

    // Delete the user (cascade will handle related records)
    await this.prisma.user.delete({
      where: { id },
    })

    return { message: "User deleted successfully" }
  }
}

