import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@padel/types';

@Injectable()
export class PlayersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // Get all registered players
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
          rating: 'desc',
        },
      },
    });

    // Get all pending invitations
    const invitations = await this.prisma.invitation.findMany({
      where: {
        status: 'PENDING',
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        invitedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map registered players
    const playersList = users.map((user) => ({
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
      invitation: null,
    }));

    // Map pending invitations as "invited players"
    const invitedPlayers = invitations.map((invitation) => ({
      id: invitation.id,
      email: invitation.email,
      name: invitation.name,
      profilePhoto: null,
      emailVerified: false,
      createdAt: invitation.createdAt,
      player: null,
      invitation: {
        id: invitation.id,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        invitedBy: invitation.invitedBy,
        invitedByUser: invitation.invitedByUser,
        token: invitation.token,
        usedAt: invitation.usedAt,
      },
    }));

    // Combine both lists
    return [...playersList, ...invitedPlayers];
  }

  async findOne(id: string) {
    // First try to find as a registered user
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        player: {
          include: {
            weeklyScores: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 10,
            },
            rankingSnapshots: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 10,
            },
          },
        },
      },
    });

    if (user) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePhoto: user.profilePhoto,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        roles: user.roles,
        player: user.player,
        invitation: null,
      };
    }

    // If not found as user, try to find as invitation (including revoked ones for admin view)
    const invitation = await this.prisma.invitation.findUnique({
      where: { id },
      include: {
        invitedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (invitation) {
      return {
        id: invitation.id,
        email: invitation.email,
        name: invitation.name,
        profilePhoto: null,
        emailVerified: false,
        createdAt: invitation.createdAt,
        roles: [],
        player: null,
        invitation: {
          id: invitation.id,
          status: invitation.status,
          expiresAt: invitation.expiresAt,
          invitedBy: invitation.invitedBy,
          invitedByUser: invitation.invitedByUser,
          token: invitation.token,
          usedAt: invitation.usedAt,
        },
      };
    }

    // If neither user nor invitation found, throw NotFoundException
    throw new NotFoundException('Player not found');
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Safeguard: Prevent deletion of admin users
    if (user.roles && user.roles.includes(Role.ADMIN)) {
      throw new BadRequestException('Cannot delete admin users');
    }

    // Delete the user (cascade will handle related records)
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }
}
