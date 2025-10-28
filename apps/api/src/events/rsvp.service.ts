import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { RSVPDto, RSVPResponse } from "@padel/types"
import { RSVPStatus } from "@padel/types"
import type { NotificationService } from "../notifications/notification.service"

@Injectable()
export class RSVPService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
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
    })

    if (!event) {
      throw new NotFoundException("Event not found")
    }

    // Check if RSVP window is open
    const now = new Date()
    if (now < event.rsvpOpensAt) {
      throw new BadRequestException("RSVP window has not opened yet")
    }

    if (now > event.rsvpClosesAt && event.state !== "FROZEN") {
      throw new BadRequestException("RSVP window has closed")
    }

    // Get player profile
    const player = await this.prisma.playerProfile.findUnique({
      where: { userId },
      include: { user: true },
    })

    if (!player) {
      throw new NotFoundException("Player profile not found")
    }

    // Handle IN request
    if (dto.status === "IN") {
      return this.handleIn(event, player)
    }

    // Handle OUT request
    return this.handleOut(event, player)
  }

  private async handleIn(event: any, player: any): Promise<RSVPResponse> {
    const existingRSVP = event.rsvps.find((r: any) => r.playerId === player.id)

    // Check if already confirmed
    if (existingRSVP?.status === RSVPStatus.CONFIRMED) {
      return {
        status: RSVPStatus.CONFIRMED,
        message: "You are already confirmed for this event",
      }
    }

    const confirmedCount = event.rsvps.filter((r: any) => r.status === RSVPStatus.CONFIRMED).length

    // Use transaction to prevent race conditions
    return this.prisma.$transaction(async (tx) => {
      // Re-check confirmed count inside transaction
      const currentConfirmed = await tx.rSVP.count({
        where: {
          eventId: event.id,
          status: RSVPStatus.CONFIRMED,
        },
      })

      const hasSpace = currentConfirmed < event.capacity

      if (hasSpace) {
        // Confirm player
        const rsvp = await tx.rSVP.upsert({
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
        })

        // Send confirmation email
        await this.notificationService.sendRSVPConfirmation(player.user.email, player.user.name || "Player", event)

        return {
          status: RSVPStatus.CONFIRMED,
          message: "You are confirmed for this event!",
        }
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
        })

        const position = (maxPosition._max.position || 0) + 1

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
        })

        // Send waitlist notification
        await this.notificationService.sendWaitlistNotification(
          player.user.email,
          player.user.name || "Player",
          event,
          position,
        )

        return {
          status: RSVPStatus.WAITLISTED,
          position,
          message: `You are on the waitlist at position #${position}`,
        }
      }
    })
  }

  private async handleOut(event: any, player: any): Promise<RSVPResponse> {
    const existingRSVP = event.rsvps.find((r: any) => r.playerId === player.id)

    if (!existingRSVP) {
      return {
        status: RSVPStatus.DECLINED,
        message: "You were not registered for this event",
      }
    }

    const wasConfirmed = existingRSVP.status === RSVPStatus.CONFIRMED

    // Delete RSVP
    await this.prisma.rSVP.delete({
      where: {
        eventId_playerId: {
          eventId: event.id,
          playerId: player.id,
        },
      },
    })

    // If was confirmed, promote first waitlisted player
    if (wasConfirmed) {
      await this.promoteNextWaitlisted(event.id)
    }

    return {
      status: RSVPStatus.CANCELLED,
      message: "You have been removed from this event",
    }
  }

  async promoteNextWaitlisted(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        rsvps: {
          where: { status: RSVPStatus.WAITLISTED },
          orderBy: { position: "asc" },
          take: 1,
          include: {
            player: {
              include: { user: true },
            },
          },
        },
      },
    })

    if (!event || event.rsvps.length === 0) {
      return
    }

    const nextPlayer = event.rsvps[0]

    // Promote to confirmed
    await this.prisma.rSVP.update({
      where: {
        eventId_playerId: {
          eventId,
          playerId: nextPlayer.playerId,
        },
      },
      data: {
        status: RSVPStatus.CONFIRMED,
        position: 0,
      },
    })

    // Reorder remaining waitlist
    const remainingWaitlist = await this.prisma.rSVP.findMany({
      where: {
        eventId,
        status: RSVPStatus.WAITLISTED,
      },
      orderBy: { position: "asc" },
    })

    for (let i = 0; i < remainingWaitlist.length; i++) {
      await this.prisma.rSVP.update({
        where: { id: remainingWaitlist[i].id },
        data: { position: i + 1 },
      })
    }

    // Send promotion notification
    await this.notificationService.sendPromotionNotification(
      nextPlayer.player.user.email,
      nextPlayer.player.user.name || "Player",
      event,
    )
  }

  async autoPromoteWaitlist(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      throw new NotFoundException("Event not found")
    }

    const now = new Date()
    if (now > event.rsvpClosesAt) {
      throw new BadRequestException("Cannot auto-promote after cutoff")
    }

    // Keep promoting until capacity is full or no more waitlisted
    let promoted = 0
    while (true) {
      const confirmedCount = await this.prisma.rSVP.count({
        where: {
          eventId,
          status: RSVPStatus.CONFIRMED,
        },
      })

      if (confirmedCount >= event.capacity) {
        break
      }

      const waitlistCount = await this.prisma.rSVP.count({
        where: {
          eventId,
          status: RSVPStatus.WAITLISTED,
        },
      })

      if (waitlistCount === 0) {
        break
      }

      await this.promoteNextWaitlisted(eventId)
      promoted++
    }

    return { promoted }
  }
}
