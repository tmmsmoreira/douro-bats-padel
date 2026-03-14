import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PlayerStatus } from '@padel/types';

@Injectable()
export class InactivityService {
  private readonly logger = new Logger(InactivityService.name);
  private readonly inactivityThresholdDays: number;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    // Default to 90 days (3 months) if not configured
    this.inactivityThresholdDays = this.configService.get<number>('INACTIVITY_THRESHOLD_DAYS', 90);
  }

  /**
   * Runs daily at 2 AM to check for inactive players
   * Players are marked as INACTIVE if they haven't:
   * - RSVPed to any event, OR
   * - Participated in any match
   * within the configured threshold period
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async checkInactivePlayers() {
    this.logger.log('Starting inactivity check...');

    try {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - this.inactivityThresholdDays);

      // Find all ACTIVE players
      const activePlayers = await this.prisma.playerProfile.findMany({
        where: {
          status: PlayerStatus.ACTIVE,
        },
        include: {
          rsvps: {
            where: {
              createdAt: {
                gte: thresholdDate,
              },
            },
            take: 1,
          },
          user: true,
        },
      });

      // Get all events with published matches in the threshold period
      const recentEvents = await this.prisma.event.findMany({
        where: {
          date: {
            gte: thresholdDate,
          },
          matches: {
            some: {
              publishedAt: {
                not: null,
              },
            },
          },
        },
        select: {
          id: true,
        },
      });

      const recentEventIds = recentEvents.map((e) => e.id);

      // Check each active player for inactivity
      const playersToMarkInactive: string[] = [];

      for (const player of activePlayers) {
        // If player has recent RSVPs, they're active
        if (player.rsvps.length > 0) {
          continue;
        }

        // Check if player participated in any recent matches
        // (by checking if they're in any draw assignments for recent events)
        const recentParticipation = await this.prisma.assignment.findFirst({
          where: {
            draw: {
              eventId: {
                in: recentEventIds,
              },
            },
            OR: [
              {
                teamA: {
                  has: player.id,
                },
              },
              {
                teamB: {
                  has: player.id,
                },
              },
            ],
          },
        });

        // If no recent RSVPs and no recent match participation, mark as inactive
        if (!recentParticipation) {
          playersToMarkInactive.push(player.id);
          this.logger.log(
            `Marking player ${player.user.name} (${player.user.email}) as INACTIVE - no activity since ${thresholdDate.toISOString()}`
          );
        }
      }

      // Bulk update players to INACTIVE status
      if (playersToMarkInactive.length > 0) {
        await this.prisma.playerProfile.updateMany({
          where: {
            id: {
              in: playersToMarkInactive,
            },
          },
          data: {
            status: PlayerStatus.INACTIVE,
          },
        });

        this.logger.log(`Marked ${playersToMarkInactive.length} player(s) as INACTIVE`);
      } else {
        this.logger.log('No inactive players found');
      }
    } catch (error) {
      this.logger.error('Error checking inactive players:', error);
    }
  }

  /**
   * Manually trigger inactivity check (useful for testing)
   */
  async triggerInactivityCheck() {
    this.logger.log('Manually triggered inactivity check');
    return this.checkInactivePlayers();
  }

  /**
   * Reactivate a player (when they RSVP or participate in an event)
   */
  async reactivatePlayer(playerId: string) {
    const player = await this.prisma.playerProfile.findUnique({
      where: { id: playerId },
    });

    if (player?.status === PlayerStatus.INACTIVE) {
      await this.prisma.playerProfile.update({
        where: { id: playerId },
        data: { status: PlayerStatus.ACTIVE },
      });

      this.logger.log(`Reactivated player ${playerId}`);
    }
  }
}
