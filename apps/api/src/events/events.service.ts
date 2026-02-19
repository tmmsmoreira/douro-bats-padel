import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateEventDto, EventWithRSVP, TierRules } from '@padel/types';
import { EventState } from '@padel/types';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

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
        venueId: dto.venueId,
        capacity: dto.capacity,
        rsvpOpensAt: new Date(dto.rsvpOpensAt),
        rsvpClosesAt: new Date(dto.rsvpClosesAt),
        state: EventState.DRAFT,
        tierRules: (dto.tierRules || {}) as any,
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
    const where: any = {};

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

    const events = await this.prisma.event.findMany({
      where,
      include: {
        venue: true,
        rsvps: {
          include: {
            player: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return events.map((event) => {
      const confirmedCount = event.rsvps.filter((r) => r.status === 'CONFIRMED').length;
      const waitlistCount = event.rsvps.filter((r) => r.status === 'WAITLISTED').length;
      const userRSVP = userId ? event.rsvps.find((r) => r.player.userId === userId) : undefined;

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
        confirmedCount,
        waitlistCount,
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
      throw new NotFoundException('Event not found');
    }

    // If not admin/editor, only allow access to published events
    if (!includeUnpublished && event.state === EventState.DRAFT) {
      throw new NotFoundException('Event not found');
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
        })),
      waitlistedPlayers: event.rsvps
        .filter((r) => r.status === 'WAITLISTED')
        .map((r) => ({
          id: r.player.id,
          name: r.player.user.name,
          position: r.position,
          rating: r.player.rating,
        })),
    };
  }

  async update(id: string, dto: Partial<CreateEventDto>) {
    const event = await this.prisma.event.findUnique({ where: { id } });

    if (!event) {
      throw new NotFoundException('Event not found');
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
        venueId: dto.venueId,
        capacity: dto.capacity,
        rsvpOpensAt: dto.rsvpOpensAt ? new Date(dto.rsvpOpensAt) : undefined,
        rsvpClosesAt: dto.rsvpClosesAt ? new Date(dto.rsvpClosesAt) : undefined,
        tierRules: dto.tierRules as any,
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

    return this.prisma.event.update({
      where: { id },
      data: { state: EventState.OPEN },
    });
  }

  async freeze(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.event.update({
      where: { id },
      data: { state: EventState.FROZEN },
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
