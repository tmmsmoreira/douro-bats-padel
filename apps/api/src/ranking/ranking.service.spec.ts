import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { createPrismaMock, type PrismaMock } from '../../test/prisma-mock';
import { EventState, Tier } from '@padel/types';

/**
 * These tests focus on the DB orchestration layer — the scoring math itself
 * is covered in packages/types/src/ranking.spec.ts. Here we verify:
 *   - Correct event/match lookups and guards
 *   - Match → assignment joining by (round, courtId)
 *   - Weekly score + ranking snapshot writes
 *   - Event state transition to PUBLISHED
 *   - Leaderboard shape + delta calculation
 *   - Recompute/reversion semantics
 */

const aWeekStart = (date: Date): Date => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  d.setUTCDate(diff);
  return d;
};

describe('RankingService.computeRankingsForEvent', () => {
  let prisma: PrismaMock;
  let notificationService: { sendResultsPublished: jest.Mock };
  let service: RankingService;

  beforeEach(() => {
    prisma = createPrismaMock();
    notificationService = { sendResultsPublished: jest.fn().mockResolvedValue(undefined) };
    service = new RankingService(prisma as any, notificationService as any);

    // Sensible defaults for happy-path tests; individual tests can override.
    prisma.event.update.mockResolvedValue({});
    prisma.weeklyScore.upsert.mockResolvedValue({});
    prisma.playerProfile.update.mockResolvedValue({});
    prisma.rankingSnapshot.create.mockResolvedValue({});
  });

  it('throws NotFoundException when the event does not exist', async () => {
    prisma.event.findUnique.mockResolvedValue(null);

    await expect(service.computeRankingsForEvent('missing')).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it('rejects when the event is not in DRAWN state', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'e1',
      state: EventState.PUBLISHED,
      date: new Date('2026-06-10'),
      matches: [],
    });

    await expect(service.computeRankingsForEvent('e1')).rejects.toThrow(/must be in DRAWN state/);
  });

  it('rejects when the event has no published matches', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'e1',
      state: EventState.DRAWN,
      date: new Date('2026-06-10'),
      matches: [],
    });

    await expect(service.computeRankingsForEvent('e1')).rejects.toThrow(/No published matches/);
  });

  it('rejects when no draw exists for the event', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'e1',
      state: EventState.DRAWN,
      date: new Date('2026-06-10'),
      matches: [{ id: 'm1', round: 1, courtId: 'c1', setsA: 2, setsB: 1, tier: Tier.MASTERS }],
    });
    prisma.draw.findFirst.mockResolvedValue(null);

    await expect(service.computeRankingsForEvent('e1')).rejects.toThrow(/No draw found/);
  });

  it('joins matches to assignments by (round, courtId), writes weekly scores + snapshots, and sets state to PUBLISHED', async () => {
    const eventDate = new Date('2026-06-10T20:00:00Z');
    prisma.event.findUnique.mockResolvedValue({
      id: 'e1',
      state: EventState.DRAWN,
      date: eventDate,
      matches: [
        {
          id: 'm1',
          round: 1,
          courtId: 'c1',
          setsA: 2,
          setsB: 0,
          tier: Tier.MASTERS,
          publishedAt: new Date(),
        },
      ],
    });
    prisma.draw.findFirst.mockResolvedValue({
      id: 'draw-1',
      assignments: [
        {
          round: 1,
          courtId: 'c1',
          teamA: ['p1', 'p2'],
          teamB: ['p3', 'p4'],
        },
      ],
    });
    prisma.playerProfile.findMany.mockResolvedValue([
      { id: 'p1', rating: 0, user: { email: 'p1@x.com', name: 'P1' }, userId: 'u1' },
      { id: 'p2', rating: 0, user: { email: 'p2@x.com', name: 'P2' }, userId: 'u2' },
      { id: 'p3', rating: 0, user: { email: 'p3@x.com', name: 'P3' }, userId: 'u3' },
      { id: 'p4', rating: 0, user: { email: 'p4@x.com', name: 'P4' }, userId: 'u4' },
    ]);
    // No prior weeks
    prisma.weeklyScore.findMany.mockResolvedValue([]);

    const result = await service.computeRankingsForEvent('e1');

    // Weekly scores: MASTERS winner (2-0) → 170 each; loser → 0 each
    expect(prisma.weeklyScore.upsert).toHaveBeenCalledTimes(4);
    const upserts = prisma.weeklyScore.upsert.mock.calls.map((c) => c[0]);
    const scoreByPlayer = Object.fromEntries(
      upserts.map((u) => [u.where.playerId_weekStart.playerId, u.create.score])
    );
    expect(scoreByPlayer.p1).toBe(170);
    expect(scoreByPlayer.p2).toBe(170);
    expect(scoreByPlayer.p3).toBe(0);
    expect(scoreByPlayer.p4).toBe(0);

    // All weeklyScore.upsert calls use the Monday 00:00 UTC of the event date
    upserts.forEach((u) =>
      expect(u.where.playerId_weekStart.weekStart.getTime()).toBe(aWeekStart(eventDate).getTime())
    );

    // Ranking snapshots written: one per player with before→after deltas
    expect(prisma.rankingSnapshot.create).toHaveBeenCalledTimes(4);
    expect(prisma.rankingSnapshot.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ algoVersion: 'v1', eventId: 'e1' }),
      })
    );

    // Event state transitions to PUBLISHED
    expect(prisma.event.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'e1' },
        data: { state: EventState.PUBLISHED },
      })
    );

    // Return shape
    expect(result.playersUpdated).toBe(4);
    expect(result.weeklyScores.p1).toBe(170);
    expect(result.newRatings.p1).toBe(170); // only 1 non-zero week, so rating = that week
  });

  it('skips match results for assignments with no matching match (match deleted / not published)', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'e1',
      state: EventState.DRAWN,
      date: new Date('2026-06-10'),
      matches: [
        {
          id: 'm1',
          round: 1,
          courtId: 'c1',
          setsA: 2,
          setsB: 0,
          tier: Tier.MASTERS,
          publishedAt: new Date(),
        },
      ],
    });
    prisma.draw.findFirst.mockResolvedValue({
      id: 'draw-1',
      assignments: [
        { round: 1, courtId: 'c1', teamA: ['p1', 'p2'], teamB: ['p3', 'p4'] },
        // Unrelated assignment — no published match exists for it
        { round: 2, courtId: 'c2', teamA: ['p5', 'p6'], teamB: ['p7', 'p8'] },
      ],
    });
    prisma.playerProfile.findMany.mockResolvedValue([
      { id: 'p1', rating: 0, user: { email: '', name: '' }, userId: 'u1' },
      { id: 'p2', rating: 0, user: { email: '', name: '' }, userId: 'u2' },
      { id: 'p3', rating: 0, user: { email: '', name: '' }, userId: 'u3' },
      { id: 'p4', rating: 0, user: { email: '', name: '' }, userId: 'u4' },
    ]);
    prisma.weeklyScore.findMany.mockResolvedValue([]);

    const result = await service.computeRankingsForEvent('e1', { notify: false });

    // Only the 4 players in the completed assignment should appear
    expect(Object.keys(result.weeklyScores).sort()).toEqual(['p1', 'p2', 'p3', 'p4']);
  });

  it('sends results-published notifications only when notify=true', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'e1',
      state: EventState.DRAWN,
      date: new Date('2026-06-10'),
      matches: [
        {
          id: 'm1',
          round: 1,
          courtId: 'c1',
          setsA: 2,
          setsB: 0,
          tier: Tier.MASTERS,
          publishedAt: new Date(),
        },
      ],
    });
    prisma.draw.findFirst.mockResolvedValue({
      id: 'draw-1',
      assignments: [{ round: 1, courtId: 'c1', teamA: ['p1', 'p2'], teamB: ['p3', 'p4'] }],
    });
    prisma.playerProfile.findMany.mockResolvedValue([
      { id: 'p1', rating: 0, user: { email: 'p1@x.com', name: 'P1' }, userId: 'u1' },
      { id: 'p2', rating: 0, user: { email: 'p2@x.com', name: 'P2' }, userId: 'u2' },
      { id: 'p3', rating: 0, user: { email: 'p3@x.com', name: 'P3' }, userId: 'u3' },
      { id: 'p4', rating: 0, user: { email: 'p4@x.com', name: 'P4' }, userId: 'u4' },
    ]);
    prisma.weeklyScore.findMany.mockResolvedValue([]);

    await service.computeRankingsForEvent('e1', { notify: false });
    expect(notificationService.sendResultsPublished).not.toHaveBeenCalled();

    // Reset counters for the second pass
    prisma.event.update.mockClear();
    notificationService.sendResultsPublished.mockClear();

    await service.computeRankingsForEvent('e1'); // notify defaults to true
    expect(notificationService.sendResultsPublished).toHaveBeenCalledTimes(4);
  });

  it('feeds previous weekly scores into the 5-week moving average', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'e1',
      state: EventState.DRAWN,
      date: new Date('2026-06-10'),
      matches: [
        {
          id: 'm1',
          round: 1,
          courtId: 'c1',
          setsA: 2,
          setsB: 0,
          tier: Tier.MASTERS,
          publishedAt: new Date(),
        },
      ],
    });
    prisma.draw.findFirst.mockResolvedValue({
      id: 'draw-1',
      assignments: [{ round: 1, courtId: 'c1', teamA: ['p1', 'p2'], teamB: ['p3', 'p4'] }],
    });
    prisma.playerProfile.findMany.mockResolvedValue([
      { id: 'p1', rating: 100, user: { email: '', name: '' }, userId: 'u1' },
      { id: 'p2', rating: 0, user: { email: '', name: '' }, userId: 'u2' },
      { id: 'p3', rating: 0, user: { email: '', name: '' }, userId: 'u3' },
      { id: 'p4', rating: 0, user: { email: '', name: '' }, userId: 'u4' },
    ]);

    // Oldest → newest: weeks -4, -3, -2, -1. p1 has values [100, 200, 0, 150]
    prisma.weeklyScore.findMany
      .mockResolvedValueOnce([{ playerId: 'p1', score: 100 }])
      .mockResolvedValueOnce([{ playerId: 'p1', score: 200 }])
      .mockResolvedValueOnce([]) // zero-score week
      .mockResolvedValueOnce([{ playerId: 'p1', score: 150 }]);

    const result = await service.computeRankingsForEvent('e1', { notify: false });

    // p1 current week = 170. Non-zero series = [100, 200, 150, 170] → avg = 155
    expect(result.newRatings.p1).toBe(155);
  });
});

describe('RankingService.recomputeRankingsForEvent', () => {
  let prisma: PrismaMock;
  let notificationService: { sendResultsPublished: jest.Mock };
  let service: RankingService;

  beforeEach(() => {
    prisma = createPrismaMock();
    notificationService = { sendResultsPublished: jest.fn().mockResolvedValue(undefined) };
    service = new RankingService(prisma as any, notificationService as any);
  });

  it('throws NotFoundException when the event is missing', async () => {
    prisma.event.findUnique.mockResolvedValue(null);

    await expect(service.recomputeRankingsForEvent('missing')).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it('rejects when there are no prior snapshots to revert', async () => {
    prisma.event.findUnique.mockResolvedValue({ id: 'e1', date: new Date() });
    prisma.rankingSnapshot.findMany.mockResolvedValue([]);

    await expect(service.recomputeRankingsForEvent('e1')).rejects.toThrow(/publish results first/);
  });
});

describe('RankingService.getLeaderboard', () => {
  let prisma: PrismaMock;
  let service: RankingService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new RankingService(prisma as any, { sendResultsPublished: jest.fn() } as any);
  });

  it('maps Prisma results to LeaderboardEntry shape with correct delta', async () => {
    prisma.playerProfile.findMany.mockResolvedValue([
      {
        id: 'p1',
        rating: 350,
        user: { name: 'Alice', profilePhoto: null },
        weeklyScores: [{ score: 300 }, { score: 200 }],
        rankingSnapshots: [{ before: 300, after: 350 }],
      },
      {
        id: 'p2',
        rating: 250,
        user: { name: 'Bob', profilePhoto: 'photo.jpg' },
        weeklyScores: [],
        rankingSnapshots: [],
      },
    ]);

    const result = await service.getLeaderboard();

    expect(result[0]).toEqual({
      playerId: 'p1',
      playerName: 'Alice',
      profilePhoto: null,
      rating: 350,
      tier: Tier.MASTERS, // rating >= 300
      delta: 50, // after - before
      weeklyScores: [300, 200],
    });
    expect(result[1].tier).toBe(Tier.EXPLORERS); // rating < 300
    expect(result[1].delta).toBe(0); // no snapshot yet
  });

  it('falls back to "Unknown" when the player has no name', async () => {
    prisma.playerProfile.findMany.mockResolvedValue([
      {
        id: 'p1',
        rating: 100,
        user: { name: null, profilePhoto: null },
        weeklyScores: [],
        rankingSnapshots: [],
      },
    ]);

    const result = await service.getLeaderboard();
    expect(result[0].playerName).toBe('Unknown');
  });

  it('respects the limit parameter', async () => {
    prisma.playerProfile.findMany.mockResolvedValue([]);

    await service.getLeaderboard(10);

    expect(prisma.playerProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10, orderBy: { rating: 'desc' } })
    );
  });
});

describe('RankingService.getPlayerHistory', () => {
  let prisma: PrismaMock;
  let service: RankingService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new RankingService(prisma as any, { sendResultsPublished: jest.fn() } as any);
  });

  it('throws NotFoundException when the player does not exist', async () => {
    prisma.playerProfile.findUnique.mockResolvedValue(null);

    await expect(service.getPlayerHistory('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('treats anonymized (DELETED) players as not found so their history is not surfaced', async () => {
    prisma.playerProfile.findUnique.mockResolvedValue({
      id: 'p1',
      rating: 200,
      status: 'DELETED',
      user: { name: null },
      weeklyScores: [{ weekStart: new Date(), score: 100 }],
      rankingSnapshots: [],
    });

    await expect(service.getPlayerHistory('p1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns current rating and history entries', async () => {
    const week = new Date('2026-06-08T00:00:00Z'); // a Monday
    prisma.playerProfile.findUnique.mockResolvedValue({
      id: 'p1',
      rating: 275,
      user: { name: 'Alice' },
      weeklyScores: [{ weekStart: week, score: 200 }],
      rankingSnapshots: [{ createdAt: new Date('2026-06-10T12:00:00Z'), before: 250, after: 275 }],
    });

    const result = await service.getPlayerHistory('p1');

    expect(result.playerId).toBe('p1');
    expect(result.currentRating).toBe(275);
    expect(result.history).toHaveLength(1);
    expect(result.history[0].score).toBe(200);
  });
});
