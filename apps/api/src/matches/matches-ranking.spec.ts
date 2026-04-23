import { MatchesService } from './matches.service';
import { RankingService } from '../ranking/ranking.service';
import { createPrismaMock, type PrismaMock } from '../../test/prisma-mock';
import { Tier, EventState } from '@padel/types';

/**
 * End-to-end exercise of the results-insertion pipeline for a mixed event:
 * one MASTERS court and one EXPLORERS court played in parallel.
 *
 * Flow under test:
 *   submitMatch(MASTERS) + submitMatch(EXPLORERS)
 *     → publishMatches()                          // sets publishedAt
 *       → RankingService.computeRankingsForEvent  // writes weeklyScore + snapshots
 *
 * Asserts the per-tier scoring formulas land on the right per-player numbers
 * and that the resulting ratings reflect a single non-zero week of history.
 */
describe('Mixed-tier results insertion → ranking calculation', () => {
  let prisma: PrismaMock;
  let matchesService: MatchesService;
  let rankingService: RankingService;
  let notificationService: { sendResultsPublished: jest.Mock };

  const eventId = 'event-1';
  const eventDate = new Date('2026-04-21T19:00:00Z');

  // 8 players: p1–p4 on the MASTERS court, p5–p8 on the EXPLORERS court.
  // All start at rating 0 so newRating = the single non-zero week's score.
  const players = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'].map((id) => ({
    id,
    rating: 0,
    user: { email: `${id}@x.com`, name: id.toUpperCase() },
    userId: `u-${id}`,
  }));

  const draw = {
    id: 'draw-1',
    assignments: [
      {
        round: 1,
        courtId: 'court-A',
        teamA: ['p1', 'p2'],
        teamB: ['p3', 'p4'],
        tier: Tier.MASTERS,
      },
      {
        round: 1,
        courtId: 'court-B',
        teamA: ['p5', 'p6'],
        teamB: ['p7', 'p8'],
        tier: Tier.EXPLORERS,
      },
    ],
  };

  beforeEach(() => {
    prisma = createPrismaMock();
    notificationService = { sendResultsPublished: jest.fn().mockResolvedValue(undefined) };
    rankingService = new RankingService(prisma as any, notificationService as any);
    matchesService = new MatchesService(prisma as any, rankingService);

    prisma.event.update.mockResolvedValue({});
    prisma.weeklyScore.upsert.mockResolvedValue({});
    prisma.playerProfile.update.mockResolvedValue({});
    prisma.rankingSnapshot.create.mockResolvedValue({});
  });

  it('inserts MASTERS + EXPLORERS results, publishes them, and computes per-tier rankings correctly', async () => {
    // ---- 1. Insertion ----
    prisma.event.findUnique.mockResolvedValue({ id: eventId, state: EventState.DRAWN });
    prisma.match.findFirst.mockResolvedValue(null);
    prisma.match.create
      .mockResolvedValueOnce({ id: 'match-masters', tier: Tier.MASTERS })
      .mockResolvedValueOnce({ id: 'match-explorers', tier: Tier.EXPLORERS });

    const reporter = 'editor-1';

    await matchesService.submitMatch(
      { eventId, courtId: 'court-A', round: 1, setsA: 2, setsB: 0, tier: Tier.MASTERS },
      reporter
    );
    await matchesService.submitMatch(
      { eventId, courtId: 'court-B', round: 1, setsA: 2, setsB: 1, tier: Tier.EXPLORERS },
      reporter
    );

    expect(prisma.match.create).toHaveBeenCalledTimes(2);
    expect(prisma.match.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: expect.objectContaining({
          courtId: 'court-A',
          tier: Tier.MASTERS,
          setsA: 2,
          setsB: 0,
        }),
      })
    );
    expect(prisma.match.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: expect.objectContaining({
          courtId: 'court-B',
          tier: Tier.EXPLORERS,
          setsA: 2,
          setsB: 1,
        }),
      })
    );

    // ---- 2. Publish (triggers ranking compute) ----
    const publishedMatches = [
      {
        id: 'match-masters',
        round: 1,
        courtId: 'court-A',
        setsA: 2,
        setsB: 0,
        tier: Tier.MASTERS,
        publishedAt: new Date(),
      },
      {
        id: 'match-explorers',
        round: 1,
        courtId: 'court-B',
        setsA: 2,
        setsB: 1,
        tier: Tier.EXPLORERS,
        publishedAt: new Date(),
      },
    ];
    prisma.event.findUnique.mockResolvedValue({
      id: eventId,
      state: EventState.DRAWN,
      date: eventDate,
      matches: publishedMatches,
    });
    prisma.match.updateMany.mockResolvedValue({ count: 2 });
    prisma.draw.findFirst.mockResolvedValue(draw);
    prisma.playerProfile.findMany.mockResolvedValue(players);
    prisma.weeklyScore.findMany.mockResolvedValue([]); // no prior weeks

    const result = await matchesService.publishMatches(eventId);
    expect(result.count).toBe(2);
    expect(prisma.match.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { eventId, publishedAt: null },
        data: { publishedAt: expect.any(Date) },
      })
    );

    // ---- 3. Per-tier weekly scores ----
    const upserts = prisma.weeklyScore.upsert.mock.calls.map((c) => c[0]);
    const scoreByPlayer = Object.fromEntries(
      upserts.map((u) => [u.where.playerId_weekStart.playerId, u.create.score])
    );

    // MASTERS winners (2-0): (300 + 20·2) / 2 = 170 each
    expect(scoreByPlayer.p1).toBe(170);
    expect(scoreByPlayer.p2).toBe(170);
    // MASTERS losers (0-2): (20·0) / 2 = 0 each
    expect(scoreByPlayer.p3).toBe(0);
    expect(scoreByPlayer.p4).toBe(0);

    // EXPLORERS winners (2-1): (200 + 15·2) / 2 = 115 each
    expect(scoreByPlayer.p5).toBe(115);
    expect(scoreByPlayer.p6).toBe(115);
    // EXPLORERS losers (1-2): (15·1) / 2 = 7.5 → Math.round → 8 each
    expect(scoreByPlayer.p7).toBe(8);
    expect(scoreByPlayer.p8).toBe(8);

    // ---- 4. New ratings (read from the side effects of the ranking write) ----
    // publishMatches() only returns { message, count }, so to verify the actual
    // computed ratings we inspect the playerProfile.update + rankingSnapshot.create
    // calls the RankingService made inside its transaction.
    const ratingByPlayer = Object.fromEntries(
      prisma.playerProfile.update.mock.calls.map((c) => [c[0].where.id, c[0].data.rating])
    );
    // Single non-zero week → rating equals that week's score
    expect(ratingByPlayer.p1).toBe(170);
    expect(ratingByPlayer.p2).toBe(170);
    expect(ratingByPlayer.p5).toBe(115);
    expect(ratingByPlayer.p6).toBe(115);
    expect(ratingByPlayer.p7).toBe(8);
    expect(ratingByPlayer.p8).toBe(8);
    // All-zero history → falls back to currentRating (0)
    expect(ratingByPlayer.p3).toBe(0);
    expect(ratingByPlayer.p4).toBe(0);

    // ---- 5. Snapshots written and event PUBLISHED ----
    expect(prisma.rankingSnapshot.create).toHaveBeenCalledTimes(8);
    const snapshotByPlayer = Object.fromEntries(
      prisma.rankingSnapshot.create.mock.calls.map((c) => [c[0].data.playerId, c[0].data])
    );
    expect(snapshotByPlayer.p1).toMatchObject({
      before: 0,
      after: 170,
      eventId,
      algoVersion: 'v1',
    });
    expect(snapshotByPlayer.p7).toMatchObject({ before: 0, after: 8, eventId, algoVersion: 'v1' });

    expect(prisma.event.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: eventId },
        data: { state: EventState.PUBLISHED },
      })
    );
  });
});
