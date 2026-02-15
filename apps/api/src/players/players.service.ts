import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"

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
      player: user.player,
    }
  }
}

