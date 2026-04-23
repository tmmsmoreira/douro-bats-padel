import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { createPrismaMock, type PrismaMock } from '../../test/prisma-mock';
import { EventState, Tier, type MatchWithTeams } from '@padel/types';

const baseDto = () => ({
  eventId: 'event-1',
  courtId: 'court-1',
  round: 1,
  setsA: 2,
  setsB: 1,
  tier: Tier.MASTERS,
});

describe('MatchesService.submitMatch', () => {
  let prisma: PrismaMock;
  let rankingService: { computeRankingsForEvent: jest.Mock };
  let service: MatchesService;

  beforeEach(() => {
    prisma = createPrismaMock();
    rankingService = { computeRankingsForEvent: jest.fn().mockResolvedValue(undefined) };
    service = new MatchesService(prisma as any, rankingService as any);
  });

  it('throws NotFoundException when the event is missing', async () => {
    prisma.event.findUnique.mockResolvedValue(null);

    await expect(service.submitMatch(baseDto(), 'user-1')).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it('rejects negative set scores', async () => {
    prisma.event.findUnique.mockResolvedValue({ id: 'event-1', state: EventState.DRAWN });

    await expect(service.submitMatch({ ...baseDto(), setsA: -1 }, 'user-1')).rejects.toBeInstanceOf(
      BadRequestException
    );
  });

  it('rejects set scores greater than 20', async () => {
    prisma.event.findUnique.mockResolvedValue({ id: 'event-1', state: EventState.DRAWN });

    await expect(service.submitMatch({ ...baseDto(), setsB: 21 }, 'user-1')).rejects.toThrow(
      /cannot exceed 20/i
    );
  });

  it('creates a new match when none exists for (event, court, round)', async () => {
    prisma.event.findUnique.mockResolvedValue({ id: 'event-1', state: EventState.DRAWN });
    prisma.match.findFirst.mockResolvedValue(null);
    prisma.match.create.mockResolvedValue({ id: 'm1' });

    await service.submitMatch(baseDto(), 'user-1');

    expect(prisma.match.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventId: 'event-1',
          courtId: 'court-1',
          round: 1,
          setsA: 2,
          setsB: 1,
          tier: Tier.MASTERS,
          reportedBy: 'user-1',
        }),
      })
    );
    expect(prisma.match.update).not.toHaveBeenCalled();
  });

  it('updates the existing match when one already exists for the same slot', async () => {
    prisma.event.findUnique.mockResolvedValue({ id: 'event-1', state: EventState.DRAWN });
    prisma.match.findFirst.mockResolvedValue({ id: 'existing-match' });
    prisma.match.update.mockResolvedValue({ id: 'existing-match' });

    await service.submitMatch({ ...baseDto(), setsA: 3, setsB: 2 }, 'user-2');

    expect(prisma.match.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'existing-match' },
        data: expect.objectContaining({ setsA: 3, setsB: 2, reportedBy: 'user-2' }),
      })
    );
    expect(prisma.match.create).not.toHaveBeenCalled();
  });

  it('accepts 0-0 (edge: unplayed but recorded) as valid input', async () => {
    prisma.event.findUnique.mockResolvedValue({ id: 'event-1', state: EventState.DRAWN });
    prisma.match.findFirst.mockResolvedValue(null);
    prisma.match.create.mockResolvedValue({});

    await expect(
      service.submitMatch({ ...baseDto(), setsA: 0, setsB: 0 }, 'u')
    ).resolves.toBeDefined();
  });
});

describe('MatchesService.publishMatches', () => {
  let prisma: PrismaMock;
  let rankingService: { computeRankingsForEvent: jest.Mock };
  let service: MatchesService;

  beforeEach(() => {
    prisma = createPrismaMock();
    rankingService = { computeRankingsForEvent: jest.fn().mockResolvedValue(undefined) };
    service = new MatchesService(prisma as any, rankingService as any);
  });

  it('rejects publishing when there are no matches', async () => {
    prisma.event.findUnique.mockResolvedValue({ id: 'e1', matches: [] });

    await expect(service.publishMatches('e1')).rejects.toThrow(/No matches to publish/);
  });

  it('marks all unpublished matches and triggers ranking computation', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'e1',
      matches: [{ id: 'm1' }, { id: 'm2' }],
    });
    prisma.match.updateMany.mockResolvedValue({ count: 2 });

    const result = await service.publishMatches('e1');

    expect(prisma.match.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { eventId: 'e1', publishedAt: null },
        data: expect.objectContaining({ publishedAt: expect.any(Date) }),
      })
    );
    expect(rankingService.computeRankingsForEvent).toHaveBeenCalledWith('e1');
    expect(result.count).toBe(2);
  });

  it('does not fail the publish when ranking computation throws', async () => {
    prisma.event.findUnique.mockResolvedValue({ id: 'e1', matches: [{ id: 'm1' }] });
    prisma.match.updateMany.mockResolvedValue({ count: 1 });
    rankingService.computeRankingsForEvent.mockRejectedValue(new Error('boom'));

    await expect(service.publishMatches('e1')).resolves.toBeDefined();
  });
});

describe('MatchesService.getMatches', () => {
  let prisma: PrismaMock;
  let service: MatchesService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new MatchesService(prisma as any, { computeRankingsForEvent: jest.fn() } as any);
  });

  it('returns the raw match list when no draw exists for the event', async () => {
    const matches = [{ id: 'm1', round: 1, courtId: 'c1', setsA: 2, setsB: 1, court: {} }];
    prisma.match.findMany.mockResolvedValue(matches);
    prisma.draw.findFirst.mockResolvedValue(null);

    const result = await service.getMatches('e1');

    // Without a draw, the service has no way to resolve team rosters — hand back
    // the raw matches so the controller still returns something useful.
    expect(result).toEqual(matches);
    expect(prisma.playerProfile.findMany).not.toHaveBeenCalled();
  });

  it('enriches matches with team player names, ratings, and rating deltas from snapshots', async () => {
    prisma.match.findMany.mockResolvedValue([
      { id: 'm1', round: 1, courtId: 'c1', setsA: 2, setsB: 1, court: { id: 'c1' } },
    ]);
    prisma.draw.findFirst.mockResolvedValue({
      id: 'draw-1',
      assignments: [{ round: 1, courtId: 'c1', teamA: ['p1', 'p2'], teamB: ['p3', 'p4'] }],
    });
    prisma.playerProfile.findMany.mockResolvedValue([
      { id: 'p1', rating: 320, user: { name: 'P1', profilePhoto: 'p1.jpg' } },
      { id: 'p2', rating: 310, user: { name: 'P2', profilePhoto: null } },
      { id: 'p3', rating: 290, user: { name: 'P3', profilePhoto: null } },
      { id: 'p4', rating: 280, user: { name: 'P4', profilePhoto: null } },
    ]);
    prisma.rankingSnapshot.findMany.mockResolvedValue([
      { playerId: 'p1', before: 300, after: 320 }, // +20
      { playerId: 'p3', before: 300, after: 290 }, // -10
    ]);

    const [enriched] = (await service.getMatches('e1')) as unknown as MatchWithTeams[];

    expect(enriched.teamA).toEqual([
      { id: 'p1', name: 'P1', rating: 320, profilePhoto: 'p1.jpg', ratingDelta: 20 },
      { id: 'p2', name: 'P2', rating: 310, profilePhoto: null, ratingDelta: undefined },
    ]);
    expect(enriched.teamB).toEqual([
      { id: 'p3', name: 'P3', rating: 290, profilePhoto: null, ratingDelta: -10 },
      { id: 'p4', name: 'P4', rating: 280, profilePhoto: null, ratingDelta: undefined },
    ]);
  });

  it('leaves teamA/teamB undefined when no assignment exists for a match slot', async () => {
    // Stale match with no corresponding assignment (e.g. draw was regenerated
    // without the old round/court combo). Should still return the match.
    prisma.match.findMany.mockResolvedValue([
      { id: 'm1', round: 5, courtId: 'c-ghost', setsA: 0, setsB: 0, court: null },
    ]);
    prisma.draw.findFirst.mockResolvedValue({
      id: 'draw-1',
      assignments: [{ round: 1, courtId: 'c1', teamA: ['p1', 'p2'], teamB: ['p3', 'p4'] }],
    });
    prisma.playerProfile.findMany.mockResolvedValue([]);
    prisma.rankingSnapshot.findMany.mockResolvedValue([]);

    const [match] = (await service.getMatches('e1')) as unknown as MatchWithTeams[];

    expect(match.id).toBe('m1');
    expect(match.teamA).toBeUndefined();
    expect(match.teamB).toBeUndefined();
  });

  it('handles missing player profiles gracefully (returns undefined name/rating)', async () => {
    prisma.match.findMany.mockResolvedValue([
      { id: 'm1', round: 1, courtId: 'c1', setsA: 2, setsB: 1, court: {} },
    ]);
    prisma.draw.findFirst.mockResolvedValue({
      id: 'draw-1',
      assignments: [{ round: 1, courtId: 'c1', teamA: ['ghost', 'p2'], teamB: ['p3', 'p4'] }],
    });
    prisma.playerProfile.findMany.mockResolvedValue([
      { id: 'p2', rating: 310, user: { name: 'P2', profilePhoto: null } },
      { id: 'p3', rating: 290, user: { name: 'P3', profilePhoto: null } },
      { id: 'p4', rating: 280, user: { name: 'P4', profilePhoto: null } },
    ]);
    prisma.rankingSnapshot.findMany.mockResolvedValue([]);

    const [match] = (await service.getMatches('e1')) as unknown as MatchWithTeams[];

    expect(match.teamA[0]).toEqual({
      id: 'ghost',
      name: undefined,
      rating: undefined,
      profilePhoto: undefined,
      ratingDelta: undefined,
    });
    expect(match.teamA[1].name).toBe('P2');
  });

  it('queries matches for the given event ordered by (round, courtId)', async () => {
    prisma.match.findMany.mockResolvedValue([]);
    prisma.draw.findFirst.mockResolvedValue(null);

    await service.getMatches('e-xyz');

    expect(prisma.match.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { eventId: 'e-xyz' },
        orderBy: [{ round: 'asc' }, { courtId: 'asc' }],
      })
    );
  });
});
