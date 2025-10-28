import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { Tier } from "@padel/types"

interface SubmitMatchDto {
  eventId: string
  courtId: string
  round: number
  setsA: number
  setsB: number
  tier: Tier
}

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  async submitMatch(dto: SubmitMatchDto, reportedBy: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    })

    if (!event) {
      throw new NotFoundException("Event not found")
    }

    // Validate sets
    if (dto.setsA < 0 || dto.setsB < 0) {
      throw new BadRequestException("Sets cannot be negative")
    }

    if (dto.setsA > 6 || dto.setsB > 6) {
      throw new BadRequestException("Sets cannot exceed 6")
    }

    // Check if match already exists
    const existingMatch = await this.prisma.match.findFirst({
      where: {
        eventId: dto.eventId,
        courtId: dto.courtId,
        round: dto.round,
      },
    })

    if (existingMatch) {
      // Update existing match
      return this.prisma.match.update({
        where: { id: existingMatch.id },
        data: {
          setsA: dto.setsA,
          setsB: dto.setsB,
          tier: dto.tier,
          reportedBy,
        },
      })
    }

    // Create new match
    return this.prisma.match.create({
      data: {
        eventId: dto.eventId,
        courtId: dto.courtId,
        round: dto.round,
        setsA: dto.setsA,
        setsB: dto.setsB,
        tier: dto.tier,
        reportedBy,
      },
    })
  }

  async publishMatches(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        matches: true,
      },
    })

    if (!event) {
      throw new NotFoundException("Event not found")
    }

    if (event.matches.length === 0) {
      throw new BadRequestException("No matches to publish")
    }

    // Publish all unpublished matches
    await this.prisma.match.updateMany({
      where: {
        eventId,
        publishedAt: null,
      },
      data: {
        publishedAt: new Date(),
      },
    })

    return {
      message: "Matches published successfully",
      count: event.matches.length,
    }
  }

  async getMatches(eventId: string) {
    const matches = await this.prisma.match.findMany({
      where: { eventId },
      include: {
        court: true,
      },
      orderBy: [{ round: "asc" }, { courtId: "asc" }],
    })

    // Get draw to enrich with player names
    const draw = await this.prisma.draw.findFirst({
      where: { eventId },
      include: {
        assignments: true,
      },
    })

    if (!draw) {
      return matches
    }

    // Get all player IDs
    const playerIds = new Set<string>()
    draw.assignments.forEach((a) => {
      a.teamA.forEach((id) => playerIds.add(id))
      a.teamB.forEach((id) => playerIds.add(id))
    })

    const players = await this.prisma.playerProfile.findMany({
      where: { id: { in: Array.from(playerIds) } },
      include: { user: true },
    })

    const playerMap = new Map(players.map((p) => [p.id, p]))

    return matches.map((match) => {
      const assignment = draw.assignments.find((a) => a.round === match.round && a.courtId === match.courtId)

      return {
        ...match,
        teamA: assignment?.teamA.map((id) => ({
          id,
          name: playerMap.get(id)?.user.name,
        })),
        teamB: assignment?.teamB.map((id) => ({
          id,
          name: playerMap.get(id)?.user.name,
        })),
      }
    })
  }
}
