import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { ConfigService } from "@nestjs/config"
import seedrandom from "seedrandom"
import { EventState, Tier } from "@padel/types"
import { NotificationService } from "../notifications/notification.service"

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
  tier: Tier
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

  async generateDraw(eventId: string, createdBy: string, constraints?: DrawConstraints, selectedCourts?: { masters?: string[]; explorers?: string[] }) {
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

    // Sort players by rating (descending) to assign tiers dynamically
    const sortedRsvps = [...event.rsvps].sort((a, b) => b.player.rating - a.player.rating)

    // Get available courts from tierRules or use selected courts if provided
    const tierRules = (event.tierRules as any) || {}
    const mastersCourts = selectedCourts?.masters || tierRules.mastersTimeSlot?.courtIds || []
    const explorersCourts = selectedCourts?.explorers || tierRules.explorersTimeSlot?.courtIds || []

    if (mastersCourts.length === 0 && explorersCourts.length === 0) {
      throw new BadRequestException("No courts available in tier time slots")
    }

    // Calculate maximum players based on court capacity (4 players per court)
    // Since tiers play at different times, capacity is ADDITIVE
    const maxPlayersPerCourt = 4
    const mastersCapacity = mastersCourts.length * maxPlayersPerCourt
    const explorersCapacity = explorersCourts.length * maxPlayersPerCourt
    const maxPlayers = mastersCapacity + explorersCapacity

    // Limit players to court capacity, taking top-rated players
    const limitedRsvps = sortedRsvps.slice(0, Math.min(sortedRsvps.length, maxPlayers))

    if (limitedRsvps.length < 4) {
      throw new BadRequestException("Need at least 4 players to generate draw")
    }

    // Adjust total player count to nearest multiple of 4 (round down)
    const adjustedPlayerCount = Math.floor(limitedRsvps.length / 4) * 4
    const adjustedRsvps = limitedRsvps.slice(0, adjustedPlayerCount)

    // Calculate tier split based on court capacity and tier rules
    let masterCount: number

    if (event.tierRules && typeof event.tierRules === "object") {
      const rules = event.tierRules as any

      if (rules.masterCount && typeof rules.masterCount === "number") {
        // Use fixed count from tier rules
        masterCount = Math.min(rules.masterCount, mastersCapacity, adjustedPlayerCount)
      } else if (rules.masterPercentage && typeof rules.masterPercentage === "number") {
        // Use percentage from tier rules
        masterCount = Math.floor((adjustedPlayerCount * rules.masterPercentage) / 100)
        masterCount = Math.min(masterCount, mastersCapacity)
      } else {
        // Default: 50/50 split, respecting court capacity
        masterCount = Math.min(Math.floor(adjustedPlayerCount / 2), mastersCapacity)
      }
    } else {
      // Default: 50/50 split, respecting court capacity
      masterCount = Math.min(Math.floor(adjustedPlayerCount / 2), mastersCapacity)
    }

    // Ensure both tiers have at least 4 players (minimum for 2 teams)
    // Adjust to nearest multiple of 4 for each tier
    masterCount = Math.floor(masterCount / 4) * 4
    const explorerCount = adjustedPlayerCount - masterCount

    if (masterCount < 4 && explorerCount < 4) {
      throw new BadRequestException("Not enough players to form teams in any tier")
    }

    // Assign tiers based on rating order and calculated split
    // Top masterCount players → MASTERS, rest → EXPLORERS
    const players: Player[] = adjustedRsvps.map((rsvp, index) => {
      const tier = index < masterCount ? Tier.MASTERS : Tier.EXPLORERS

      return {
        id: rsvp.player.id,
        name: rsvp.player.user.name || "Unknown",
        rating: rsvp.player.rating,
        tier,
      }
    })

    console.log(`Tier assignment: ${masterCount} MASTERS, ${explorerCount} EXPLORERS (Total: ${players.length})`)

    const finalPlayers = players

    if (finalPlayers.length === 0) {
      throw new BadRequestException("Not enough players to form complete teams")
    }

    const courts = event.venue?.courts || []
    if (courts.length === 0) {
      throw new BadRequestException("No courts available at venue")
    }

    // Get tier-specific courts from tierRules
    const mastersCourtObjects = courts.filter((c) => mastersCourts.includes(c.id))
    const explorersCourtObjects = courts.filter((c) => explorersCourts.includes(c.id))

    // Generate seed for reproducibility
    const seed = `${eventId}-${Date.now()}-${Math.random()}`

    // Get recent match history for constraints
    const recentHistory = await this.getRecentMatchHistory(
      finalPlayers.map((p) => p.id),
      constraints?.avoidRecentSessions || 4,
    )

    // Generate matches with tier-specific courts
    const matches = this.createMatches(
      finalPlayers,
      mastersCourtObjects,
      explorersCourtObjects,
      seed,
      recentHistory,
      constraints,
    )

    // Save draw to database
    const draw = await this.prisma.draw.create({
      data: {
        eventId,
        createdBy,
        constraintsJson: (constraints as any) || {},
        assignments: {
          create: matches.map((match) => ({
            round: match.round,
            courtId: match.courtId,
            teamA: [match.teamA.player1.id, match.teamA.player2.id],
            teamB: [match.teamB.player1.id, match.teamB.player2.id],
            tier: match.tier,
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

    // Move excess CONFIRMED players to WAITLISTED status
    // Players who were CONFIRMED but didn't make it into the draw due to capacity limits
    const playersInDraw = new Set(adjustedRsvps.map((r) => r.player.id))
    const excessPlayers = sortedRsvps.filter((r) => !playersInDraw.has(r.player.id))

    if (excessPlayers.length > 0) {
      console.log(`Moving ${excessPlayers.length} excess players to waitlist`)

      // Get current max position in waitlist (if any existing waitlisted players)
      const existingWaitlist = await this.prisma.rSVP.findMany({
        where: {
          eventId,
          status: "WAITLISTED",
        },
        orderBy: {
          position: "desc",
        },
        take: 1,
      })

      let nextPosition = existingWaitlist.length > 0 && existingWaitlist[0].position ? existingWaitlist[0].position + 1 : 1

      // Update each excess player to WAITLISTED status with position
      for (const rsvp of excessPlayers) {
        await this.prisma.rSVP.update({
          where: { id: rsvp.id },
          data: {
            status: "WAITLISTED",
            position: nextPosition++,
          },
        })
      }
    }

    // Notify players
    const emails = event.rsvps.map((r) => r.player.user.email).filter(Boolean) as string[]
    await this.notificationService.announceEventOpen(emails, event)

    return draw
  }

  private createMatches(
    players: Player[],
    mastersCourts: any[],
    explorersCourts: any[],
    seed: string,
    recentHistory: Map<string, Set<string>>,
    constraints?: DrawConstraints,
  ): Match[] {
    const rng = seedrandom(seed)
    const matches: Match[] = []

    // Separate by tier
    const masterPlayers = players.filter((p) => p.tier === Tier.MASTERS)
    const explorerPlayers = players.filter((p) => p.tier === Tier.EXPLORERS)

    // Generate matches for each tier with their specific courts
    // Each tier has its own round numbering starting from 1
    if (masterPlayers.length >= 4) {
      const masterMatches = this.generateTierMatches(
        masterPlayers,
        mastersCourts,
        rng,
        recentHistory,
        constraints,
        Tier.MASTERS,
      )
      matches.push(...masterMatches)
    }

    if (explorerPlayers.length >= 4) {
      const explorerMatches = this.generateTierMatches(
        explorerPlayers,
        explorersCourts,
        rng,
        recentHistory,
        constraints,
        Tier.EXPLORERS,
      )
      matches.push(...explorerMatches)
    }

    // Handle mixed tier if needed and allowed (use all available courts)
    const remainingPlayers = [...masterPlayers, ...explorerPlayers].filter(
      (p) => !matches.some((m) => this.playerInMatch(p, m)),
    )

    if (remainingPlayers.length >= 4 && constraints?.allowTierMixing) {
      const allCourts = [...mastersCourts, ...explorersCourts]
      const mixedMatches = this.generateTierMatches(
        remainingPlayers,
        allCourts,
        rng,
        recentHistory,
        constraints,
        Tier.EXPLORERS, // Use EXPLORERS tier for mixed matches
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
    tier: Tier = Tier.EXPLORERS,
  ): Match[] {
    const matches: Match[] = []
    const numTeams = players.length / 2

    // Maximum simultaneous matches = min(available courts, max possible simultaneous matches)
    // Max simultaneous matches = numTeams / 2 (since each match uses 2 teams)
    const maxSimultaneousMatches = Math.min(courts.length, Math.floor(numTeams / 2))

    // Create balanced teams (pairs of players) - only from the same tier
    const teams = this.createBalancedTeams(players, rng, recentHistory, constraints)

    // Generate complete round-robin schedule
    // All teams play against each other, distributed across multiple rounds
    const rounds = this.generateRoundRobin(teams, maxSimultaneousMatches)

    // Each tier has its own round numbering starting from 1
    rounds.forEach((round, roundIndex) => {
      round.forEach((matchup, courtIndex) => {
        matches.push({
          round: roundIndex + 1, // Round numbering starts at 1 for each tier
          courtId: courts[courtIndex % courts.length].id,
          teamA: matchup.teamA,
          teamB: matchup.teamB,
          tier, // Add tier information to the match
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

    // Log player tiers for debugging
    console.log('Creating teams for players:', sortedPlayers.map(p => ({ name: p.name, tier: p.tier })))

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
        console.log(`Paired ${player1.name} with ${bestPartner.name}`)
        teams.push({
          player1,
          player2: bestPartner,
          avgRating: (player1.rating + bestPartner.rating) / 2,
        })
        used.add(player1.id)
        used.add(bestPartner.id)
      } else {
        console.log(`WARNING: Could not find partner for ${player1.name} (${player1.tier})`)
      }
    }

    console.log(`Created ${teams.length} teams from ${players.length} players`)
    return teams
  }

  private generateRoundRobin(teams: Team[], numCourts: number): Array<Array<{ teamA: Team; teamB: Team }>> {
    const n = teams.length
    const allMatches: Array<{ teamA: Team; teamB: Team }> = []

    // Generate all possible matchups using round-robin algorithm
    const teamsCopy = [...teams]

    for (let round = 0; round < n - 1; round++) {
      for (let i = 0; i < n / 2; i++) {
        const team1Index = i
        const team2Index = n - 1 - i

        if (team1Index !== team2Index) {
          allMatches.push({
            teamA: teamsCopy[team1Index],
            teamB: teamsCopy[team2Index],
          })
        }
      }

      // Rotate teams (keep first team fixed)
      const lastTeam = teamsCopy.pop()!
      teamsCopy.splice(1, 0, lastTeam)
    }

    // Distribute all matches across rounds based on available courts
    const rounds: Array<Array<{ teamA: Team; teamB: Team }>> = []

    for (let i = 0; i < allMatches.length; i += numCourts) {
      rounds.push(allMatches.slice(i, i + numCourts))
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

  /**
   * Assign tier dynamically based on player position in sorted rating list
   * Top half of players get MASTERS, bottom half get EXPLORERS
   * This can be customized per event using tierRules if needed
   */
  private assignTierForEvent(playerIndex: number, totalPlayers: number, event: any): Tier {
    // Check if event has custom tier rules
    if (event.tierRules && typeof event.tierRules === "object") {
      const rules = event.tierRules as any

      // If tierRules specifies a split point (e.g., { masterCount: 12 })
      if (rules.masterCount && typeof rules.masterCount === "number") {
        return playerIndex < rules.masterCount ? Tier.MASTERS : Tier.EXPLORERS
      }

      // If tierRules specifies a percentage (e.g., { masterPercentage: 50 })
      if (rules.masterPercentage && typeof rules.masterPercentage === "number") {
        const splitPoint = Math.floor((totalPlayers * rules.masterPercentage) / 100)
        return playerIndex < splitPoint ? Tier.MASTERS : Tier.EXPLORERS
      }
    }

    // Default: split evenly - top half are MASTERS, bottom half are EXPLORERS
    const splitPoint = Math.floor(totalPlayers / 2)
    return playerIndex < splitPoint ? Tier.MASTERS : Tier.EXPLORERS
  }

  private playerInMatch(player: Player, match: Match): boolean {
    return (
      match.teamA.player1.id === player.id ||
      match.teamA.player2.id === player.id ||
      match.teamB.player1.id === player.id ||
      match.teamB.player2.id === player.id
    )
  }

  async getDraw(eventId: string, user?: any) {
    const draw = await this.prisma.draw.findFirst({
      where: { eventId },
      include: {
        assignments: {
          include: {
            court: true,
          },
          orderBy: [{ round: "asc" }, { courtId: "asc" }],
        },
        event: {
          include: {
            venue: {
              include: {
                courts: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (!draw) {
      throw new NotFoundException("Draw not found for this event")
    }

    // Check if user is admin/editor
    const isAdmin = user?.roles?.includes("ADMIN") || user?.roles?.includes("EDITOR")

    // If user is not admin and event is not published, don't show the draw
    if (!isAdmin && draw.event.state !== EventState.PUBLISHED) {
      throw new NotFoundException("Draw not available yet")
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

    // Sort players by rating to recalculate tier assignment for this event
    const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating)
    const playerIndexMap = new Map<string, number>()
    sortedPlayers.forEach((p, index) => {
      playerIndexMap.set(p.id, index)
    })

    type PlayerWithUser = typeof players[0]
    const playerMap = new Map<string, PlayerWithUser>(players.map((p) => [p.id, p]))

    return {
      ...draw,
      assignments: draw.assignments.map((a) => ({
        ...a,
        teamA: a.teamA.map((id) => {
          const p = playerMap.get(id)
          if (!p) throw new Error(`Player with id ${id} not found`)
          const playerIndex = playerIndexMap.get(id) || 0
          const tier = this.assignTierForEvent(playerIndex, players.length, draw.event)
          return {
            id: p.id,
            name: p.user.name,
            rating: p.rating,
            tier,
          }
        }),
        teamB: a.teamB.map((id) => {
          const p = playerMap.get(id)
          if (!p) throw new Error(`Player with id ${id} not found`)
          const playerIndex = playerIndexMap.get(id) || 0
          const tier = this.assignTierForEvent(playerIndex, players.length, draw.event)
          return {
            id: p.id,
            name: p.user.name,
            rating: p.rating,
            tier,
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
      data: { state: EventState.PUBLISHED },
    })

    return { message: "Draw published successfully" }
  }

  async unpublishDraw(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        draws: true,
      },
    })

    if (!event) {
      throw new NotFoundException("Event not found")
    }

    if (event.state !== EventState.PUBLISHED) {
      throw new BadRequestException("Draw is not published")
    }

    if (event.draws.length === 0) {
      throw new BadRequestException("No draw found for this event")
    }

    // Unpublish by setting state back to FROZEN
    await this.prisma.event.update({
      where: { id: eventId },
      data: { state: EventState.FROZEN },
    })

    return { message: "Draw unpublished successfully" }
  }

  async deleteDraw(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        draws: true,
        rsvps: {
          where: { status: "WAITLISTED" },
        },
      },
    })

    if (!event) {
      throw new NotFoundException("Event not found")
    }

    if (event.draws.length === 0) {
      throw new BadRequestException("No draw found for this event")
    }

    // Delete all assignments first (cascade should handle this, but being explicit)
    await this.prisma.assignment.deleteMany({
      where: { drawId: event.draws[0].id },
    })

    // Delete the draw
    await this.prisma.draw.delete({
      where: { id: event.draws[0].id },
    })

    // Move all WAITLISTED players back to CONFIRMED status
    // This allows them to be included in a new draw if regenerated
    if (event.rsvps.length > 0) {
      console.log(`Restoring ${event.rsvps.length} waitlisted players to CONFIRMED status`)

      await this.prisma.rSVP.updateMany({
        where: {
          eventId,
          status: "WAITLISTED",
        },
        data: {
          status: "CONFIRMED",
          position: null,
        },
      })
    }

    // Reset event state to FROZEN so admin can regenerate
    await this.prisma.event.update({
      where: { id: eventId },
      data: { state: EventState.FROZEN },
    })

    return { message: "Draw deleted successfully" }
  }
}
