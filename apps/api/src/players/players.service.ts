import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlayerStatus, Role } from '@padel/types';

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
            notificationsPaused: user.player.notificationsPaused,
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

  async findOne(id: string, requester?: { roles?: Role[] | string[] } | null) {
    const isAdmin = !!requester?.roles?.some((r) => r === Role.ADMIN);

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
      const publicFields = {
        id: user.id,
        name: user.name,
        profilePhoto: user.profilePhoto,
        player: user.player,
      };

      if (!isAdmin) {
        return publicFields;
      }

      return {
        ...publicFields,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        roles: user.roles,
        dateOfBirth: user.dateOfBirth,
        phoneNumber: user.phoneNumber,
        invitation: null,
      };
    }

    // Invitation lookups are admin-only — don't leak invitation metadata publicly
    if (isAdmin) {
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
    }

    // If neither user nor invitation found, throw NotFoundException
    throw new NotFoundException('Player not found');
  }

  /**
   * Anonymize (soft-delete) a user. Scrubs PII from the User row and marks
   * their PlayerProfile as DELETED so leaderboard + player-history queries
   * hide them, while preserving the PlayerProfile + WeeklyScore +
   * RankingSnapshot rows so historical leaderboards remain internally
   * consistent. Previously, this method hard-deleted the user, which
   * cascade-wiped all their ranking history.
   *
   * The original email is released (replaced with `deleted-{id}@…`) so the
   * person can re-register with the same address via a fresh invitation.
   * tokenVersion is bumped to invalidate any outstanding refresh tokens and
   * passwordHash is cleared so the anonymized account can no longer log in.
   */
  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { player: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Safeguard: prevent anonymizing admin users. Unchanged from the prior
    // hard-delete behavior — admins must first be demoted.
    if (user.roles && user.roles.includes(Role.ADMIN)) {
      throw new BadRequestException('Cannot delete admin users');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          email: `deleted-${id}@dorobats.invalid`,
          name: null,
          passwordHash: null,
          phoneNumber: null,
          profilePhoto: null,
          dateOfBirth: null,
          emailVerificationToken: null,
          emailVerificationExpires: null,
          resetPasswordToken: null,
          resetPasswordExpires: null,
          tokenVersion: { increment: 1 },
          roles: [Role.VIEWER],
        },
      });

      if (user.player) {
        await tx.playerProfile.update({
          where: { id: user.player.id },
          data: { status: PlayerStatus.DELETED },
        });
      }

      await tx.pushSubscription.deleteMany({ where: { userId: id } });
    });

    return { message: 'User deleted successfully' };
  }
}
