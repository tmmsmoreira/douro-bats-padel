import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  computeRanking,
  type MatchResult,
  type LeaderboardEntry,
  type PlayerHistory,
  toTier,
} from '@padel/types';
import { EventState, Locale, type Tier } from '@padel/types';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class RankingService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService
  ) {}

  async computeRankingsForEvent(eventId: string, options: { notify?: boolean } = {}) {
    const { notify = true } = options;
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        matches: {
          where: {
            publishedAt: { not: null },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.matches.length === 0) {
      throw new BadRequestException('No published matches found for this event');
    }

    // Get all players involved in matches
    const playerIds = new Set<string>();
    const matchResults: MatchResult[] = [];

    // Build match results from assignments
    const draw = await this.prisma.draw.findFirst({
      where: { eventId },
      include: {
        assignments: true,
      },
    });

    if (!draw) {
      throw new BadRequestException('No draw found for this event');
    }

    // Index matches by (round, courtId) once so the lookup below is O(1) per
    // assignment instead of O(matches) inside an O(assignments) loop.
    const matchKey = (round: number, courtId: string | null) => `${round}:${courtId ?? ''}`;
    const matchByRoundCourt = new Map(event.matches.map((m) => [matchKey(m.round, m.courtId), m]));

    for (const assignment of draw.assignments) {
      const match = matchByRoundCourt.get(matchKey(assignment.round, assignment.courtId));
      if (!match) continue;

      const [p1, p2] = assignment.teamA;
      const [p3, p4] = assignment.teamB;

      playerIds.add(p1);
      playerIds.add(p2);
      playerIds.add(p3);
      playerIds.add(p4);

      matchResults.push({
        matchId: match.id,
        tier: match.tier as Tier,
        teamA: [p1, p2],
        teamB: [p3, p4],
        setsA: match.setsA,
        setsB: match.setsB,
      });
    }

    // Get current ratings
    const players = await this.prisma.playerProfile.findMany({
      where: { id: { in: Array.from(playerIds) } },
      include: { user: true },
    });

    const currentRatings: Record<string, number> = {};
    players.forEach((p) => {
      currentRatings[p.id] = p.rating;
    });

    // Get last 4 weeks of scores for 5-week moving average (parallel fetch).
    const weekStart = this.getWeekStart(event.date);
    const playerIdsArray = Array.from(playerIds);

    const weeklyWindow = await Promise.all(
      // Oldest → newest, so the resulting array is already in the expected order.
      [4, 3, 2, 1].map(async (i) => {
        const pastWeek = new Date(weekStart);
        pastWeek.setDate(pastWeek.getDate() - i * 7);

        const weekScores = await this.prisma.weeklyScore.findMany({
          where: {
            playerId: { in: playerIdsArray },
            weekStart: pastWeek,
          },
        });

        const weekMap: Record<string, number> = {};
        weekScores.forEach((ws) => {
          weekMap[ws.playerId] = ws.score;
        });
        return weekMap;
      })
    );

    // Compute new rankings
    const { weeklyScore, newRatings } = computeRanking({
      currentRatings,
      weeklyWindow,
      matches: matchResults,
    });

    // Atomic writes: weekly scores + player ratings + snapshots + event state.
    // A partial commit here would corrupt the leaderboard, so all-or-nothing.
    await this.prisma.$transaction(async (tx) => {
      await Promise.all(
        Object.entries(weeklyScore).map(([playerId, score]) =>
          tx.weeklyScore.upsert({
            where: { playerId_weekStart: { playerId, weekStart } },
            create: { playerId, weekStart, score },
            update: { score },
          })
        )
      );

      await Promise.all(
        Object.entries(newRatings).flatMap(([playerId, newRating]) => {
          const oldRating = currentRatings[playerId] || 0;
          return [
            tx.playerProfile.update({
              where: { id: playerId },
              data: { rating: newRating },
            }),
            tx.rankingSnapshot.create({
              data: {
                playerId,
                eventId,
                before: oldRating,
                after: newRating,
                algoVersion: 'v1',
              },
            }),
          ];
        })
      );

      await tx.event.update({
        where: { id: eventId },
        data: { state: EventState.PUBLISHED },
      });
    });

    if (notify) {
      // Notify players
      await Promise.allSettled(
        players
          .filter((p) => p.user?.email)
          .map((p) =>
            this.notificationService.sendResultsPublished(
              p.user.email,
              p.user.name || 'Player',
              event,
              p.user.preferredLanguage as Locale,
              p.userId
            )
          )
      );
    }

    return {
      playersUpdated: Object.keys(newRatings).length,
      weeklyScores: weeklyScore,
      newRatings,
    };
  }

  async recomputeRankingsForEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const snapshots = await this.prisma.rankingSnapshot.findMany({
      where: { eventId },
    });

    if (snapshots.length === 0) {
      throw new BadRequestException(
        'No prior rankings found for this event — publish results first'
      );
    }

    const affectedPlayerIds = Array.from(new Set(snapshots.map((s) => s.playerId)));
    const weekStart = this.getWeekStart(event.date);

    // Revert player ratings to the state before the previous compute
    await this.prisma.$transaction([
      ...snapshots.map((snapshot) =>
        this.prisma.playerProfile.update({
          where: { id: snapshot.playerId },
          data: { rating: snapshot.before },
        })
      ),
      this.prisma.rankingSnapshot.deleteMany({ where: { eventId } }),
      this.prisma.weeklyScore.deleteMany({
        where: {
          playerId: { in: affectedPlayerIds },
          weekStart,
        },
      }),
    ]);

    return this.computeRankingsForEvent(eventId, { notify: false });
  }

  async getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    // Narrow selects: the leaderboard UI only needs name + photo from User,
    // score from weeklyScores, and before/after from the latest snapshot.
    // Avoids pulling passwordHash / reset tokens / verification tokens etc.
    const players = await this.prisma.playerProfile.findMany({
      where: {
        status: { in: ['ACTIVE', 'INACTIVE'] },
      },
      select: {
        id: true,
        rating: true,
        user: {
          select: {
            name: true,
            profilePhoto: true,
          },
        },
        weeklyScores: {
          orderBy: { weekStart: 'desc' },
          take: 5,
          select: { score: true },
        },
        rankingSnapshots: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { before: true, after: true },
        },
      },
      orderBy: {
        rating: 'desc',
      },
      take: limit,
    });

    return players.map((player) => {
      const latestSnapshot = player.rankingSnapshots[0];
      const delta = latestSnapshot ? latestSnapshot.after - latestSnapshot.before : 0;

      return {
        playerId: player.id,
        playerName: player.user.name || 'Unknown',
        profilePhoto: player.user.profilePhoto,
        rating: player.rating,
        // Calculate display tier based on rating (for leaderboard display only)
        // Actual tier assignment happens per event in draw generation
        tier: toTier(player.rating),
        delta,
        weeklyScores: player.weeklyScores.map((ws) => ws.score),
      };
    });
  }

  async getPlayerHistory(playerId: string): Promise<PlayerHistory> {
    const player = await this.prisma.playerProfile.findUnique({
      where: { id: playerId },
      include: {
        user: true,
        weeklyScores: {
          orderBy: { weekStart: 'desc' },
          take: 10,
        },
        rankingSnapshots: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    // Build history with ratings over time
    const history = player.weeklyScores.map((ws) => {
      const snapshot = player.rankingSnapshots.find((rs) => {
        const rsWeek = this.getWeekStart(rs.createdAt);
        return rsWeek.getTime() === ws.weekStart.getTime();
      });

      return {
        weekStart: ws.weekStart,
        score: ws.score,
        rating: snapshot?.after || player.rating,
      };
    });

    return {
      playerId: player.id,
      playerName: player.user.name || 'Unknown',
      // Calculate display tier based on rating (for display only)
      // Actual tier assignment happens per event in draw generation
      tier: toTier(player.rating),
      currentRating: player.rating,
      history,
    };
  }

  /**
   * Get the Monday 00:00:00 UTC of the week containing the given date.
   * Uses UTC consistently to avoid timezone drift across environments.
   */
  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    const day = d.getUTCDay();
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    d.setUTCDate(diff);
    return d;
  }
}
