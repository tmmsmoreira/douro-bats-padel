import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { RSVPDto, RSVPResponse } from '@padel/types';
import { Locale, RSVPStatus, PlayerStatus } from '@padel/types';
import {
  NotificationService,
  type EventNotificationData,
} from '../notifications/notification.service';
import type { PrismaClient } from '@prisma/client';

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

@Injectable()
export class RSVPService {
  private readonly logger = new Logger(RSVPService.name);

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService
  ) {}

  async handleRSVP(eventId: string, userId: string, dto: RSVPDto): Promise<RSVPResponse> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        rsvps: {
          include: {
            player: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if RSVP window is open
    const now = new Date();
    if (now < event.rsvpOpensAt) {
      throw new BadRequestException('RSVP window has not opened yet');
    }

    if (now > event.rsvpClosesAt && event.state !== 'FROZEN') {
      throw new BadRequestException('RSVP window has closed');
    }

    // Get player profile - create one if it doesn't exist
    let player = await this.prisma.playerProfile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!player) {
      // Auto-create player profile for users who don't have one
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      player = await this.prisma.playerProfile.create({
        data: {
          userId,
          rating: 0,
          status: 'ACTIVE',
        },
        include: { user: true },
      });
    }

    // Handle IN request
    if (dto.status === 'IN') {
      return this.handleIn(event, player);
    }

    // Handle OUT request
    return this.handleOut(event, player);
  }

  private async handleIn(event: any, player: any): Promise<RSVPResponse> {
    const existingRSVP = event.rsvps.find((r: any) => r.playerId === player.id);

    // Check if already confirmed
    if (existingRSVP?.status === RSVPStatus.CONFIRMED) {
      return {
        status: RSVPStatus.CONFIRMED,
        message: 'You are already confirmed for this event',
      };
    }

    // Use transaction to prevent race conditions
    return this.prisma.$transaction(async (tx) => {
      // Re-check confirmed count inside transaction
      const currentConfirmed = await tx.rSVP.count({
        where: {
          eventId: event.id,
          status: RSVPStatus.CONFIRMED,
        },
      });

      const hasSpace = currentConfirmed < event.capacity;

      if (hasSpace) {
        // Confirm player
        await tx.rSVP.upsert({
          where: {
            eventId_playerId: {
              eventId: event.id,
              playerId: player.id,
            },
          },
          create: {
            eventId: event.id,
            playerId: player.id,
            status: RSVPStatus.CONFIRMED,
            position: 0,
          },
          update: {
            status: RSVPStatus.CONFIRMED,
            position: 0,
            updatedAt: new Date(),
          },
        });

        // Reactivate player if they were inactive
        if (player.status === PlayerStatus.INACTIVE) {
          await tx.playerProfile.update({
            where: { id: player.id },
            data: { status: PlayerStatus.ACTIVE },
          });
        }

        // Send confirmation notification
        await this.notificationService.sendRSVPConfirmation(
          player.user.email,
          player.user.name || 'Player',
          event,
          player.user.preferredLanguage as Locale,
          player.user.id
        );

        return {
          status: RSVPStatus.CONFIRMED,
          message: 'You are confirmed for this event!',
        };
      } else {
        // Add to waitlist
        const maxPosition = await tx.rSVP.aggregate({
          where: {
            eventId: event.id,
            status: RSVPStatus.WAITLISTED,
          },
          _max: {
            position: true,
          },
        });

        const position = (maxPosition._max.position || 0) + 1;

        await tx.rSVP.upsert({
          where: {
            eventId_playerId: {
              eventId: event.id,
              playerId: player.id,
            },
          },
          create: {
            eventId: event.id,
            playerId: player.id,
            status: RSVPStatus.WAITLISTED,
            position,
          },
          update: {
            status: RSVPStatus.WAITLISTED,
            position,
            updatedAt: new Date(),
          },
        });

        // Send waitlist notification
        await this.notificationService.sendWaitlistNotification(
          player.user.email,
          player.user.name || 'Player',
          event,
          position,
          player.user.preferredLanguage as Locale,
          player.user.id
        );

        return {
          status: RSVPStatus.WAITLISTED,
          position,
          message: `You are on the waitlist at position #${position}`,
        };
      }
    });
  }

  private async handleOut(event: any, player: any): Promise<RSVPResponse> {
    const existingRSVP = event.rsvps.find((r: any) => r.playerId === player.id);

    if (!existingRSVP) {
      return {
        status: RSVPStatus.DECLINED,
        message: 'You were not registered for this event',
      };
    }

    const wasConfirmed = existingRSVP.status === RSVPStatus.CONFIRMED;

    // Wrap delete + promotion in a transaction to ensure atomicity
    await this.prisma.$transaction(async (tx) => {
      await tx.rSVP.delete({
        where: {
          eventId_playerId: {
            eventId: event.id,
            playerId: player.id,
          },
        },
      });

      // If was confirmed, promote first waitlisted player
      if (wasConfirmed) {
        await this.promoteNextWaitlisted(event.id, tx);
      }
    });

    return {
      status: RSVPStatus.CANCELLED,
      message: 'You have been removed from this event',
    };
  }

  /**
   * Reorder waitlist positions sequentially starting from 1.
   * Uses parallel updates for better performance.
   */
  private async reorderWaitlist(eventId: string, tx: TransactionClient): Promise<void> {
    const remainingWaitlist = await tx.rSVP.findMany({
      where: {
        eventId,
        status: RSVPStatus.WAITLISTED,
      },
      orderBy: { position: 'asc' },
    });

    if (remainingWaitlist.length === 0) return;

    await Promise.all(
      remainingWaitlist.map((rsvp, i) =>
        tx.rSVP.update({
          where: { id: rsvp.id },
          data: { position: i + 1 },
        })
      )
    );
  }

  async promoteNextWaitlisted(eventId: string, tx?: TransactionClient) {
    // runPromotion does only DB work and returns the promoted player so the
    // caller can fire the email outside the transaction boundary. Emailing
    // inside the tx would hold a DB connection open during network IO and
    // could roll back the promotion on transient email failures.
    const runPromotion = async (prisma: TransactionClient) => {
      const nextWaitlisted = await prisma.rSVP.findFirst({
        where: {
          eventId,
          status: RSVPStatus.WAITLISTED,
        },
        orderBy: { position: 'asc' },
        include: {
          player: {
            include: { user: true },
          },
        },
      });

      if (!nextWaitlisted) return null;

      await prisma.rSVP.update({
        where: {
          eventId_playerId: {
            eventId,
            playerId: nextWaitlisted.playerId,
          },
        },
        data: {
          status: RSVPStatus.CONFIRMED,
          position: 0,
        },
      });

      await this.reorderWaitlist(eventId, prisma);

      return nextWaitlisted;
    };

    // Reuse an existing transaction if the caller is already inside one;
    // otherwise open a fresh transaction. Avoids nested `$transaction` calls,
    // which Prisma does not support and which can deadlock under load.
    const promoted = tx
      ? await runPromotion(tx)
      : await this.prisma.$transaction((newTx) => runPromotion(newTx));

    if (promoted) {
      try {
        await this.notificationService.sendPromotionNotification(
          promoted.player.user.email,
          promoted.player.user.name || 'Player',
          { id: eventId } as EventNotificationData,
          promoted.player.user.preferredLanguage as Locale,
          promoted.player.user.id
        );
      } catch (err) {
        this.logger.error('Failed to send waitlist promotion notification', err);
      }
    }
  }

  async autoPromoteWaitlist(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const now = new Date();
    if (now > event.rsvpClosesAt) {
      throw new BadRequestException('Cannot auto-promote after cutoff');
    }

    // Calculate how many spots to fill in one query
    const confirmedCount = await this.prisma.rSVP.count({
      where: { eventId, status: RSVPStatus.CONFIRMED },
    });

    const availableSpots = event.capacity - confirmedCount;
    if (availableSpots <= 0) {
      return { promoted: 0 };
    }

    // Fetch exactly the number of waitlisted players we can promote
    const toPromote = await this.prisma.rSVP.findMany({
      where: { eventId, status: RSVPStatus.WAITLISTED },
      orderBy: { position: 'asc' },
      take: availableSpots,
      include: {
        player: {
          include: { user: true },
        },
      },
    });

    if (toPromote.length === 0) {
      return { promoted: 0 };
    }

    // Bulk-promote in a single transaction
    await this.prisma.$transaction(async (tx) => {
      // Update all promoted RSVPs to CONFIRMED
      await Promise.all(
        toPromote.map((rsvp) =>
          tx.rSVP.update({
            where: { id: rsvp.id },
            data: { status: RSVPStatus.CONFIRMED, position: 0 },
          })
        )
      );

      // Reorder remaining waitlist
      await this.reorderWaitlist(eventId, tx);
    });

    // Send notifications in parallel (outside transaction to avoid long locks)
    await Promise.all(
      toPromote.map((rsvp) =>
        this.notificationService.sendPromotionNotification(
          rsvp.player.user.email,
          rsvp.player.user.name || 'Player',
          event,
          rsvp.player.user.preferredLanguage as Locale,
          rsvp.player.user.id
        )
      )
    );

    return { promoted: toPromote.length };
  }

  async removePlayerFromEvent(eventId: string, playerId: string) {
    // Find the event
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Find the RSVP
    const rsvp = await this.prisma.rSVP.findUnique({
      where: {
        eventId_playerId: {
          eventId,
          playerId,
        },
      },
    });

    if (!rsvp) {
      throw new NotFoundException('Player is not registered for this event');
    }

    const wasConfirmed = rsvp.status === RSVPStatus.CONFIRMED;
    const wasWaitlisted = rsvp.status === RSVPStatus.WAITLISTED;

    // Wrap delete + promotion/reorder in a transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.rSVP.delete({
        where: {
          eventId_playerId: {
            eventId,
            playerId,
          },
        },
      });

      // If player was confirmed, promote next waitlisted player
      if (wasConfirmed) {
        await this.promoteNextWaitlisted(eventId, tx);
      }

      // If player was waitlisted, reorder remaining waitlist
      if (wasWaitlisted) {
        await this.reorderWaitlist(eventId, tx);
      }
    });

    return { message: 'Player removed from event successfully' };
  }
}
