import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { computeRanking, type MatchResult, type LeaderboardEntry, type PlayerHistory } from "@padel/types"
import { EventState, type Tier } from "@padel/types"
import { NotificationService } from "../notifications/notification.service"

@Injectable()
export class RankingService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async computeRankingsForEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        matches: {
          where: {
            publishedAt: { not: null },
          },
        },
      },
    })

    if (!event) {
      throw new NotFoundException("Event not found")
    }

    if (event.matches.length === 0) {
      throw new BadRequestException("No published matches found for this event")
    }

    // Get all players involved in matches
    const playerIds = new Set<string>()
    const matchResults: MatchResult[] = []

    // Build match results from assignments
    const draw = await this.prisma.draw.findFirst({
      where: { eventId },
      include: {
        assignments: true,
      },
    })

    if (!draw) {
      throw new BadRequestException("No draw found for this event")
    }

    // Match assignments with match results
    for (const assignment of draw.assignments) {
      const match = event.matches.find((m) => m.round === assignment.round && m.courtId === assignment.courtId)

      if (match) {
        const [p1, p2] = assignment.teamA
        const [p3, p4] = assignment.teamB

        playerIds.add(p1)
        playerIds.add(p2)
        playerIds.add(p3)
        playerIds.add(p4)

        matchResults.push({
          matchId: match.id,
          tier: match.tier as Tier,
          teamA: [p1, p2],
          teamB: [p3, p4],
          setsA: match.setsA,
          setsB: match.setsB,
        })
      }
    }

    // Get current ratings
    const players = await this.prisma.playerProfile.findMany({
      where: { id: { in: Array.from(playerIds) } },
      include: { user: true },
    })

    const currentRatings: Record<string, number> = {}
    players.forEach((p) => {
      currentRatings[p.id] = p.rating
    })

    // Get last 4 weeks of scores for 5-week moving average
    const weekStart = this.getWeekStart(event.date)
    const weeklyWindow: Array<Record<string, number>> = []

    for (let i = 1; i <= 4; i++) {
      const pastWeek = new Date(weekStart)
      pastWeek.setDate(pastWeek.getDate() - i * 7)

      const weekScores = await this.prisma.weeklyScore.findMany({
        where: {
          playerId: { in: Array.from(playerIds) },
          weekStart: pastWeek,
        },
      })

      const weekMap: Record<string, number> = {}
      weekScores.forEach((ws) => {
        weekMap[ws.playerId] = ws.score
      })

      weeklyWindow.unshift(weekMap)
    }

    // Compute new rankings
    const { weeklyScore, newRatings } = computeRanking({
      currentRatings,
      weeklyWindow,
      matches: matchResults,
    })

    // Save weekly scores
    for (const [playerId, score] of Object.entries(weeklyScore)) {
      await this.prisma.weeklyScore.upsert({
        where: {
          playerId_weekStart: {
            playerId,
            weekStart,
          },
        },
        create: {
          playerId,
          weekStart,
          score,
        },
        update: {
          score,
        },
      })
    }

    // Update player ratings (tier is assigned dynamically per event, not stored)
    for (const [playerId, newRating] of Object.entries(newRatings)) {
      const oldRating = currentRatings[playerId] || 0

      await this.prisma.playerProfile.update({
        where: { id: playerId },
        data: {
          rating: newRating,
        },
      })

      // Create ranking snapshot
      await this.prisma.rankingSnapshot.create({
        data: {
          playerId,
          eventId,
          before: oldRating,
          after: newRating,
          algoVersion: "v1",
        },
      })
    }

    // Update event state
    await this.prisma.event.update({
      where: { id: eventId },
      data: { state: EventState.PUBLISHED },
    })

    // Notify players
    const emails = players.map((p) => p.user?.email).filter(Boolean) as string[]
    await this.notificationService.sendResultsPublished(emails[0], "Players", event)

    return {
      playersUpdated: Object.keys(newRatings).length,
      weeklyScores: weeklyScore,
      newRatings,
    }
  }

  async getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    const players = await this.prisma.playerProfile.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        user: true,
        weeklyScores: {
          orderBy: { weekStart: "desc" },
          take: 5,
        },
        rankingSnapshots: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: {
        rating: "desc",
      },
      take: limit,
    })

    return players.map((player) => {
      const latestSnapshot = player.rankingSnapshots[0]
      const delta = latestSnapshot ? latestSnapshot.after - latestSnapshot.before : 0

      return {
        playerId: player.id,
        playerName: player.user.name || "Unknown",
        rating: player.rating,
        tier: player.tier as Tier,
        delta,
        weeklyScores: player.weeklyScores.map((ws) => ws.score),
      }
    })
  }

  async getPlayerHistory(playerId: string): Promise<PlayerHistory> {
    const player = await this.prisma.playerProfile.findUnique({
      where: { id: playerId },
      include: {
        user: true,
        weeklyScores: {
          orderBy: { weekStart: "desc" },
          take: 10,
        },
        rankingSnapshots: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })

    if (!player) {
      throw new NotFoundException("Player not found")
    }

    // Build history with ratings over time
    const history = player.weeklyScores.map((ws) => {
      const snapshot = player.rankingSnapshots.find((rs) => {
        const rsWeek = this.getWeekStart(rs.createdAt)
        return rsWeek.getTime() === ws.weekStart.getTime()
      })

      return {
        weekStart: ws.weekStart,
        score: ws.score,
        rating: snapshot?.after || player.rating,
      }
    })

    return {
      playerId: player.id,
      playerName: player.user.name || "Unknown",
      tier: player.tier as Tier,
      currentRating: player.rating,
      history,
    }
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday
    d.setDate(diff)
    return d
  }
}
