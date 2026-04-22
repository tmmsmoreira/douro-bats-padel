import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';
import type { Prisma } from '@prisma/client';
import type { CreateEventDto, EventWithRSVP, TierRules } from '@padel/types';
import { EventState, RSVPStatus } from '@padel/types';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService
  ) {}

  /**
   * Validate tier rules configuration
   */
  private validateTierRules(tierRules: TierRules | undefined, capacity: number): void {
    if (!tierRules) {
      throw new BadRequestException('Tier rules are required');
    }

    // Ensure only one rule is specified
    if (tierRules.masterCount !== undefined && tierRules.masterPercentage !== undefined) {
      throw new BadRequestException(
        'Cannot specify both masterCount and masterPercentage in tier rules'
      );
    }

    // Validate masterCount
    if (tierRules.masterCount !== undefined) {
      if (!Number.isInteger(tierRules.masterCount) || tierRules.masterCount < 0) {
        throw new BadRequestException('masterCount must be a non-negative integer');
      }
      if (tierRules.masterCount > capacity) {
        throw new BadRequestException(
          `masterCount (${tierRules.masterCount}) cannot exceed event capacity (${capacity})`
        );
      }
    }

    // Validate masterPercentage
    if (tierRules.masterPercentage !== undefined) {
      if (
        typeof tierRules.masterPercentage !== 'number' ||
        tierRules.masterPercentage < 0 ||
        tierRules.masterPercentage > 100
      ) {
        throw new BadRequestException('masterPercentage must be a number between 0 and 100');
      }
    }

    // Validate time slots (now required)
    if (!tierRules.mastersTimeSlot) {
      throw new BadRequestException('MASTERS time slot is required');
    }
    if (!tierRules.explorersTimeSlot) {
      throw new BadRequestException('EXPLORERS time slot is required');
    }

    // Validate MASTERS time slot
    const {
      startsAt: mastersStart,
      endsAt: mastersEnd,
      courtIds: mastersCourts,
    } = tierRules.mastersTimeSlot;

    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(mastersStart)) {
      throw new BadRequestException(
        `Invalid MASTERS start time format: ${mastersStart}. Expected HH:MM format.`
      );
    }
    if (!timeRegex.test(mastersEnd)) {
      throw new BadRequestException(
        `Invalid MASTERS end time format: ${mastersEnd}. Expected HH:MM format.`
      );
    }
    if (!mastersCourts || mastersCourts.length === 0) {
      throw new BadRequestException('MASTERS time slot must have at least one court assigned');
    }

    // Validate EXPLORERS time slot
    const {
      startsAt: explorersStart,
      endsAt: explorersEnd,
      courtIds: explorersCourts,
    } = tierRules.explorersTimeSlot;

    if (!timeRegex.test(explorersStart)) {
      throw new BadRequestException(
        `Invalid EXPLORERS start time format: ${explorersStart}. Expected HH:MM format.`
      );
    }
    if (!timeRegex.test(explorersEnd)) {
      throw new BadRequestException(
        `Invalid EXPLORERS end time format: ${explorersEnd}. Expected HH:MM format.`
      );
    }
    if (!explorersCourts || explorersCourts.length === 0) {
      throw new BadRequestException('EXPLORERS time slot must have at least one court assigned');
    }
  }

  async create(dto: CreateEventDto, _createdBy: string) {
    // Validate tier rules
    this.validateTierRules(dto.tierRules, dto.capacity);

    const event = await this.prisma.event.create({
      data: {
        title: dto.title,
        date: new Date(dto.date),
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        format: dto.format || 'NON_STOP',
        duration: dto.duration,
        venueId: dto.venueId,
        capacity: dto.capacity,
        rsvpOpensAt: new Date(dto.rsvpOpensAt),
        rsvpClosesAt: new Date(dto.rsvpClosesAt),
        state: EventState.DRAFT,
        tierRules: (dto.tierRules || {}) as Prisma.InputJsonValue,
        eventCourts: {
          create: dto.courtIds.map((courtId) => ({
            courtId,
          })),
        },
      },
      include: {
        venue: true,
        eventCourts: {
          include: {
            court: true,
          },
        },
      },
    });

    return event;
  }

  async findAll(from?: Date, to?: Date, userId?: string, includeUnpublished = false) {
    const where: Prisma.EventWhereInput = {};

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = from;
      if (to) where.date.lte = to;
    }

    // Only show published events to non-admin users
    if (!includeUnpublished) {
      where.state = {
        in: [EventState.OPEN, EventState.FROZEN, EventState.DRAWN, EventState.PUBLISHED],
      };
    }

    // Fetch events without loading full RSVP + player + user data
    const events = await this.prisma.event.findMany({
      where,
      include: {
        venue: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    if (events.length === 0) return [];

    const eventIds = events.map((e) => e.id);

    // Get RSVP counts grouped by eventId and status in a single query
    const rsvpCounts = await this.prisma.rSVP.groupBy({
      by: ['eventId', 'status'],
      where: { eventId: { in: eventIds } },
      _count: true,
    });

    // Build a lookup map: eventId -> { confirmed, waitlisted }
    const countsMap = new Map<string, { confirmed: number; waitlisted: number }>();
    for (const row of rsvpCounts) {
      const entry = countsMap.get(row.eventId) || { confirmed: 0, waitlisted: 0 };
      if (row.status === RSVPStatus.CONFIRMED) entry.confirmed = row._count;
      if (row.status === RSVPStatus.WAITLISTED) entry.waitlisted = row._count;
      countsMap.set(row.eventId, entry);
    }

    // Get user's RSVPs for all events in a single query (if logged in)
    let userRsvpMap = new Map<string, { status: string; position: number }>();
    if (userId) {
      const player = await this.prisma.playerProfile.findUnique({ where: { userId } });
      if (player) {
        const userRsvps = await this.prisma.rSVP.findMany({
          where: { eventId: { in: eventIds }, playerId: player.id },
          select: { eventId: true, status: true, position: true },
        });
        for (const rsvp of userRsvps) {
          userRsvpMap.set(rsvp.eventId, { status: rsvp.status, position: rsvp.position });
        }
      }
    }

    return events.map((event) => {
      const counts = countsMap.get(event.id) || { confirmed: 0, waitlisted: 0 };
      const userRSVP = userRsvpMap.get(event.id);

      return {
        id: event.id,
        title: event.title,
        date: event.date,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        capacity: event.capacity,
        state: event.state,
        rsvpOpensAt: event.rsvpOpensAt,
        rsvpClosesAt: event.rsvpClosesAt,
        venue: event.venue
          ? {
              id: event.venue.id,
              name: event.venue.name,
            }
          : undefined,
        confirmedCount: counts.confirmed,
        waitlistCount: counts.waitlisted,
        userRSVP: userRSVP
          ? {
              status: userRSVP.status,
              position: userRSVP.position,
            }
          : undefined,
      } as EventWithRSVP;
    });
  }

  async findOne(id: string, userId?: string, includeUnpublished = false) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        venue: {
          include: {
            courts: true,
          },
        },
        eventCourts: {
          include: {
            court: true,
          },
        },
        rsvps: {
          include: {
            player: {
              include: {
                user: true,
              },
            },
          },
          orderBy: [{ status: 'asc' }, { position: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });

    if (!event) {
      this.logger.log(`Event not found in database: ${id}`);
      throw new NotFoundException('Event not found');
    }

    // If not admin, only allow access to published events
    // Must match the same state filter as findAll()
    if (!includeUnpublished) {
      const allowedStates: string[] = [
        EventState.OPEN,
        EventState.FROZEN,
        EventState.DRAWN,
        EventState.PUBLISHED,
      ];
      if (!allowedStates.includes(event.state as string)) {
        this.logger.log(
          `Event ${id} exists but state ${event.state} is not in allowed states for non-admin users`
        );
        throw new NotFoundException('Event not found');
      }
    }

    const confirmedCount = event.rsvps.filter((r) => r.status === 'CONFIRMED').length;
    const waitlistCount = event.rsvps.filter((r) => r.status === 'WAITLISTED').length;
    const userRSVP = userId ? event.rsvps.find((r) => r.player.userId === userId) : undefined;

    return {
      ...event,
      confirmedCount,
      waitlistCount,
      userRSVP: userRSVP
        ? {
            status: userRSVP.status,
            position: userRSVP.position,
          }
        : undefined,
      confirmedPlayers: event.rsvps
        .filter((r) => r.status === 'CONFIRMED')
        .map((r) => ({
          id: r.player.id,
          name: r.player.user.name,
          rating: r.player.rating,
          profilePhoto: r.player.user.profilePhoto,
        })),
      waitlistedPlayers: event.rsvps
        .filter((r) => r.status === 'WAITLISTED')
        .map((r) => ({
          id: r.player.id,
          name: r.player.user.name,
          position: r.position,
          rating: r.player.rating,
          profilePhoto: r.player.user.profilePhoto,
        })),
    };
  }

  async update(id: string, dto: Partial<CreateEventDto>) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        rsvps: {
          where: { status: RSVPStatus.CONFIRMED },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if event has passed
    const eventEndTime = new Date(event.endsAt);
    const hasEventPassed = eventEndTime < new Date();

    // Allow editing if:
    // 1. Event hasn't passed yet, OR
    // 2. Event was never published (state is DRAFT, OPEN, or FROZEN), OR
    // 3. Event was never drawn (state is DRAFT, OPEN, or FROZEN)
    const canEdit =
      !hasEventPassed ||
      event.state === EventState.DRAFT ||
      event.state === EventState.OPEN ||
      event.state === EventState.FROZEN;

    if (!canEdit) {
      throw new BadRequestException('Cannot update a past event that has been drawn or published');
    }

    // When players are registered, block edits that actually change event timing.
    // Compare values — the frontend sends the full DTO on every update, so presence
    // alone would flag unchanged timing as an edit.
    if (event.rsvps.length > 0) {
      const isChanged = (incoming: Date | string | undefined, current: Date) =>
        incoming !== undefined && new Date(incoming).getTime() !== current.getTime();
      const isEditingTiming =
        isChanged(dto.date, event.date) ||
        isChanged(dto.startsAt, event.startsAt) ||
        isChanged(dto.endsAt, event.endsAt);

      if (isEditingTiming) {
        throw new BadRequestException(
          'Cannot edit event timing (date, start time, or end time) when players are already registered'
        );
      }
    }

    // Validate tier rules if provided
    const capacity = dto.capacity ?? event.capacity;
    if (dto.tierRules !== undefined) {
      this.validateTierRules(dto.tierRules, capacity);
    }

    // If courtIds are provided, update the eventCourts relationship
    if (dto.courtIds) {
      // Delete existing court associations
      await this.prisma.eventCourt.deleteMany({
        where: { eventId: id },
      });

      // Create new court associations
      await this.prisma.eventCourt.createMany({
        data: dto.courtIds.map((courtId) => ({
          eventId: id,
          courtId,
        })),
      });
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        title: dto.title,
        date: dto.date ? new Date(dto.date) : undefined,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        format: dto.format,
        duration: dto.duration,
        venueId: dto.venueId,
        capacity: dto.capacity,
        rsvpOpensAt: dto.rsvpOpensAt ? new Date(dto.rsvpOpensAt) : undefined,
        rsvpClosesAt: dto.rsvpClosesAt ? new Date(dto.rsvpClosesAt) : undefined,
        tierRules: dto.tierRules as unknown as Prisma.InputJsonValue,
      },
      include: {
        venue: true,
        eventCourts: {
          include: {
            court: true,
          },
        },
      },
    });
  }

  async publish(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.state !== EventState.DRAFT) {
      throw new BadRequestException('Event is not in draft state');
    }

    const updated = await this.prisma.event.update({
      where: { id },
      data: { state: EventState.OPEN },
    });

    try {
      const activePlayers = await this.prisma.playerProfile.findMany({
        where: {
          status: 'ACTIVE',
          notificationsPaused: false,
          user: { email: { not: '' } },
        },
        include: { user: { select: { id: true, email: true } } },
      });
      const recipients = activePlayers
        .filter((p) => p.user.email)
        .map((p) => ({ email: p.user.email, userId: p.user.id }));
      await this.notificationService.announceEventOpen(recipients, updated);
    } catch (err) {
      this.logger.error('Failed to send event open announcement', err);
    }

    return updated;
  }

  async freeze(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // State machine: DRAFT → OPEN → FROZEN → DRAWN → PUBLISHED.
    // Only OPEN → FROZEN is valid here.
    if (event.state !== EventState.OPEN) {
      throw new BadRequestException('Only open events can be frozen');
    }

    return this.prisma.event.update({
      where: { id },
      data: { state: EventState.FROZEN },
    });
  }

  async unfreeze(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        draws: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.state !== EventState.FROZEN) {
      throw new BadRequestException('Event is not in frozen state');
    }

    // Check if event has a draw - cannot unfreeze if draw exists
    if (event.draws.length > 0) {
      throw new BadRequestException(
        'Cannot unfreeze event with existing draw. Delete the draw first.'
      );
    }

    return this.prisma.event.update({
      where: { id },
      data: { state: EventState.OPEN },
    });
  }

  async remove(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Delete the event (cascade will handle related records like RSVPs and EventCourts)
    await this.prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }
}
