import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { CreateEventDto, EventWithRSVP } from "@padel/types"
import { EventState } from "@padel/types"

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEventDto, createdBy: string) {
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
        tierRules: dto.tierRules || {},
      },
      include: {
        venue: true,
      },
    })

    return event
  }

  async findAll(from?: Date, to?: Date, userId?: string) {
    const where: any = {}

    if (from || to) {
      where.date = {}
      if (from) where.date.gte = from
      if (to) where.date.lte = to
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
        date: "asc",
      },
    })

    return events.map((event) => {
      const confirmedCount = event.rsvps.filter((r) => r.status === "CONFIRMED").length
      const waitlistCount = event.rsvps.filter((r) => r.status === "WAITLISTED").length
      const userRSVP = userId ? event.rsvps.find((r) => r.player.userId === userId) : undefined

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
      } as EventWithRSVP
    })
  }

  async findOne(id: string, userId?: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
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
          orderBy: [{ status: "asc" }, { position: "asc" }, { createdAt: "asc" }],
        },
      },
    })

    if (!event) {
      throw new NotFoundException("Event not found")
    }

    const confirmedCount = event.rsvps.filter((r) => r.status === "CONFIRMED").length
    const waitlistCount = event.rsvps.filter((r) => r.status === "WAITLISTED").length
    const userRSVP = userId ? event.rsvps.find((r) => r.player.userId === userId) : undefined

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
        .filter((r) => r.status === "CONFIRMED")
        .map((r) => ({
          id: r.player.id,
          name: r.player.user.name,
          rating: r.player.rating,
          tier: r.player.tier,
        })),
      waitlistedPlayers: event.rsvps
        .filter((r) => r.status === "WAITLISTED")
        .map((r) => ({
          id: r.player.id,
          name: r.player.user.name,
          position: r.position,
          rating: r.player.rating,
          tier: r.player.tier,
        })),
    }
  }

  async update(id: string, dto: Partial<CreateEventDto>) {
    const event = await this.prisma.event.findUnique({ where: { id } })

    if (!event) {
      throw new NotFoundException("Event not found")
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
        tierRules: dto.tierRules,
      },
    })
  }

  async publish(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } })

    if (!event) {
      throw new NotFoundException("Event not found")
    }

    if (event.state !== EventState.DRAFT) {
      throw new BadRequestException("Event is not in draft state")
    }

    return this.prisma.event.update({
      where: { id },
      data: { state: EventState.OPEN },
    })
  }

  async freeze(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } })

    if (!event) {
      throw new NotFoundException("Event not found")
    }

    return this.prisma.event.update({
      where: { id },
      data: { state: EventState.FROZEN },
    })
  }
}
