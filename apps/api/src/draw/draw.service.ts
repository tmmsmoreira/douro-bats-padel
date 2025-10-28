import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import type { ConfigService } from "@nestjs/config"
import seedrandom from "seedrandom"
import { EventState, Tier } from "@padel/types"
import type { NotificationService } from "../notifications/notification.service"

interface Player {
  id: string
  name: string
  rating: number
  tier: Tier
}

interface Team {
  player1: Player
  player2: Player
  avgRating: number
}

interface Match {
  round: number
  courtId: string
  teamA: Team
  teamB: Team
}

interface DrawConstraints {
  avoidRecentSessions?: number
  balanceStrength?: boolean
  allowTierMixing?: boolean
}

@Injectable()
export class DrawService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private notificationService: NotificationService,
  ) {}

  async generateDraw(eventId: string, createdBy: string, constraints?: DrawConstraints) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        venue: {
          include: {
            courts: true,
          },
        },
        rsvps: {
          where: { status: "CONFIRMED" },
          include: {
            player: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    })

    if (!event) {
      throw new NotFoundException("Event not found")
    }

    if (event.state !== EventState.FROZEN && event.state !== EventState.OPEN) {
      throw new BadRequestException("Event must be frozen before generating draw")
    }

    const players: Player[] = event.rsvps.map((rsvp) => ({
      id: rsvp.player.id,
      name: rsvp.player.user.name || "Unknown",
      rating: rsvp.player.rating,
      tier: rsvp.player.tier,
    }))

    if (players.length < 4) {
      throw new BadRequestException("Need at least 4 players to generate draw")
    }

    // Ensure players count is multiple of 4
    if (players.length % 4 !== 0) {
      throw new BadRequestException(`Player count must be multiple of 4. Current: ${players.length}`)
    }

    const courts = event.venue?.courts || []
    if (courts.length === 0) {
      throw new BadRequestException("No courts available at venue")
    }

    // Generate seed for reproducibility
    const seed = `${eventId}-${Date.now()}-${Math.random()}`

    // Get recent match history for constraints
    const recentHistory = await this.getRecentMatchHistory(
      players.map((p) => p.id),
      constraints?.avoidRecentSessions || 4,
    )

    // Generate matches
    const matches = this.createMatches(players, courts, seed, recentHistory, constraints)

    // Save draw to database
    const draw = await this.prisma.draw.create({
      data: {
        eventId,
        createdBy,
        constraintsJson: constraints || {},
        assignments: {
          create: matches.map((match) => ({
            round: match.round,
            courtId: match.courtId,
            teamA: [match.teamA.player1.id, match.teamA.player2.id],
            teamB: [match.teamB.player1.id, match.teamB.player2.id],
          })),
        },
      },
      include: {
        assignments: true,
      },
    })

    // Update event state and seed
    await this.prisma.event.update({
      where: { id: eventId },
      data: {
        state: EventState.DRAWN,
        seed,
      },
    })

    // Notify players
    const emails = event.rsvps.map((r) => r.player.user.email).filter(Boolean) as string[]
    await this.notificationService.announceEventOpen(emails, event)

    return draw
  }

  private createMatches(
    players: Player[],
    courts: any[],
    seed: string,
    recentHistory: Map<string, Set<string>>,
    constraints?: DrawConstraints,
  ): Match[] {
    const rng = seedrandom(seed)
    const matches: Match[] = []

    // Separate by tier
    const masterPlayers = players.filter((p) => p.tier === Tier.MASTERS)
    const explorerPlayers = players.filter((p) => p.tier === Tier.EXPLORERS)

    // Generate matches for each tier
    if (masterPlayers.length >= 4) {
      const masterMatches = this.generateTierMatches(masterPlayers, courts, rng, recentHistory, constraints, 0)
      matches.push(...masterMatches)
    }

    if (explorerPlayers.length >= 4) {
      const explorerMatches = this.generateTierMatches(
        explorerPlayers,
        courts,
        rng,
        recentHistory,
        constraints,
        masterPlayers.length >= 4 ? Math.ceil(masterPlayers.length / 4) : 0,
      )
      matches.push(...explorerMatches)
    }

    // Handle mixed tier if needed and allowed
    const remainingPlayers = [...masterPlayers, ...explorerPlayers].filter(
      (p) => !matches.some((m) => this.playerInMatch(p, m)),
    )

    if (remainingPlayers.length >= 4 && constraints?.allowTierMixing) {
      const mixedMatches = this.generateTierMatches(
        remainingPlayers,
        courts,
        rng,
        recentHistory,
        constraints,
        matches.length,
      )
      matches.push(...mixedMatches)
    }

    return matches
  }

  private generateTierMatches(
    players: Player[],
    courts: any[],
    rng: () => number,
    recentHistory: Map<string, Set<string>>,
    constraints?: DrawConstraints,
    startRound = 0,
  ): Match[] {
    const matches: Match[] = []
    const numTeams = players.length / 2
    const numCourts = Math.min(courts.length, Math.floor(numTeams / 2))

    // Create teams
    const teams = this.createBalancedTeams(players, rng, recentHistory, constraints)

    // Generate round-robin matches (5 rounds for 6 teams)
    const rounds = this.generateRoundRobin(teams, numCourts)

    rounds.forEach((round, roundIndex) => {
      round.forEach((matchup, courtIndex) => {
        matches.push({
          round: startRound + roundIndex + 1,
          courtId: courts[courtIndex % courts.length].id,
          teamA: matchup.teamA,
          teamB: matchup.teamB,
        })
      })
    })

    return matches
  }

  private createBalancedTeams(
    players: Player[],
    rng: () => number,
    recentHistory: Map<string, Set<string>>,
    constraints?: DrawConstraints,
  ): Team[] {
    // Sort by rating for balanced pairing
    const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating)

    const teams: Team[] = []
    const used = new Set<string>()

    // Try to create balanced teams avoiding recent partners
    for (let i = 0; i < sortedPlayers.length; i++) {
      if (used.has(sortedPlayers[i].id)) continue

      const player1 = sortedPlayers[i]
      let bestPartner: Player | null = null
      let bestScore = Number.NEGATIVE_INFINITY

      for (let j = i + 1; j < sortedPlayers.length; j++) {
        if (used.has(sortedPlayers[j].id)) continue

        const player2 = sortedPlayers[j]

        // Calculate pairing score
        let score = 0

        // Prefer balanced ratings
        const ratingDiff = Math.abs(player1.rating - player2.rating)
        score -= ratingDiff * 0.5

        // Avoid recent partners
        if (constraints?.avoidRecentSessions) {
          const recentPartners = recentHistory.get(player1.id) || new Set()
          if (recentPartners.has(player2.id)) {
            score -= 1000 // Heavy penalty for recent partners
          }
        }

        // Add some randomness
        score += rng() * 10

        if (score > bestScore) {
          bestScore = score
          bestPartner = player2
        }
      }

      if (bestPartner) {
        teams.push({
          player1,
          player2: bestPartner,
          avgRating: (player1.rating + bestPartner.rating) / 2,
        })
        used.add(player1.id)
        used.add(bestPartner.id)
      }
    }

    return teams
  }

  private generateRoundRobin(teams: Team[], numCourts: number): Array<Array<{ teamA: Team; teamB: Team }>> {
    const rounds: Array<Array<{ teamA: Team; teamB: Team }>> = []
    const n = teams.length

    // Round-robin algorithm
    for (let round = 0; round < n - 1; round++) {
      const roundMatches: Array<{ teamA: Team; teamB: Team }> = []

      for (let i = 0; i < n / 2; i++) {
        const team1Index = i
        const team2Index = n - 1 - i

        if (team1Index !== team2Index) {
          roundMatches.push({
            teamA: teams[team1Index],
            teamB: teams[team2Index],
          })
        }
      }

      rounds.push(roundMatches.slice(0, numCourts))

      // Rotate teams (keep first team fixed)
      const lastTeam = teams.pop()!
      teams.splice(1, 0, lastTeam)
    }

    return rounds
  }

  private async getRecentMatchHistory(playerIds: string[], sessions: number): Promise<Map<string, Set<string>>> {
    const history = new Map<string, Set<string>>()

    // Get recent events
    const recentEvents = await this.prisma.event.findMany({
      where: {
        state: EventState.PUBLISHED,
        date: {
          gte: new Date(Date.now() - sessions * 7 * 24 * 60 * 60 * 1000), // Last N weeks
        },
      },
      include: {
        draws: {
          include: {
            assignments: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: sessions,
    })

    // Build partner/opponent history
    for (const event of recentEvents) {
      for (const draw of event.draws) {
        for (const assignment of draw.assignments) {
          const [p1, p2] = assignment.teamA
          const [p3, p4] = assignment.teamB

          // Track partners
          if (!history.has(p1)) history.set(p1, new Set())
          if (!history.has(p2)) history.set(p2, new Set())
          if (!history.has(p3)) history.set(p3, new Set())
          if (!history.has(p4)) history.set(p4, new Set())

          history.get(p1)!.add(p2)
          history.get(p2)!.add(p1)
          history.get(p3)!.add(p4)
          history.get(p4)!.add(p3)

          // Track opponents
          history.get(p1)!.add(p3)
          history.get(p1)!.add(p4)
          history.get(p2)!.add(p3)
          history.get(p2)!.add(p4)
          history.get(p3)!.add(p1)
          history.get(p3)!.add(p2)
          history.get(p4)!.add(p1)
          history.get(p4)!.add(p2)
        }
      }
    }

    return history
  }

  private playerInMatch(player: Player, match: Match): boolean {
    return (
      match.teamA.player1.id === player.id ||
      match.teamA.player2.id === player.id ||
      match.teamB.player1.id === player.id ||
      match.teamB.player2.id === player.id
    )
  }

  async getDraw(eventId: string) {
    const draw = await this.prisma.draw.findFirst({
      where: { eventId },
      include: {
        assignments: {
          include: {
            court: true,
          },
          orderBy: [{ round: "asc" }, { courtId: "asc" }],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (!draw) {
      throw new NotFoundException("Draw not found for this event")
    }

    // Enrich with player details
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

    return {
      ...draw,
      assignments: draw.assignments.map((a) => ({
        ...a,
        teamA: a.teamA.map((id) => {
          const p = playerMap.get(id)
          return {
            id: p?.id,
            name: p?.user.name,
            rating: p?.rating,
            tier: p?.tier,
          }
        }),
        teamB: a.teamB.map((id) => {
          const p = playerMap.get(id)
          return {
            id: p?.id,
            name: p?.user.name,
            rating: p?.rating,
            tier: p?.tier,
          }
        }),
      })),
    }
  }

  async updateAssignment(assignmentId: string, teamA: string[], teamB: string[], updatedBy: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        draw: {
          include: {
            event: true,
          },
        },
      },
    })

    if (!assignment) {
      throw new NotFoundException("Assignment not found")
    }

    // Audit log
    console.log(`[AUDIT] Assignment ${assignmentId} updated by ${updatedBy}`)
    console.log(`Before: TeamA=${assignment.teamA}, TeamB=${assignment.teamB}`)
    console.log(`After: TeamA=${teamA}, TeamB=${teamB}`)

    return this.prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        teamA,
        teamB,
      },
    })
  }

  async publishDraw(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        draws: true,
      },
    })

    if (!event) {
      throw new NotFoundException("Event not found")
    }

    if (event.draws.length === 0) {
      throw new BadRequestException("No draw generated for this event")
    }

    await this.prisma.event.update({
      where: { id: eventId },
      data: { state: EventState.DRAWN },
    })

    return { message: "Draw published successfully" }
  }
}
