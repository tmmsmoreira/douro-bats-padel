import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { createPrismaMock, type PrismaMock } from '../../test/prisma-mock';
import { Tier } from '@padel/types';

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
    prisma.event.findUnique.mockResolvedValue({ id: 'event-1' });

    await expect(service.submitMatch({ ...baseDto(), setsA: -1 }, 'user-1')).rejects.toBeInstanceOf(
      BadRequestException
    );
  });

  it('rejects set scores greater than 20', async () => {
    prisma.event.findUnique.mockResolvedValue({ id: 'event-1' });

    await expect(service.submitMatch({ ...baseDto(), setsB: 21 }, 'user-1')).rejects.toThrow(
      /cannot exceed 20/i
    );
  });

  it('creates a new match when none exists for (event, court, round)', async () => {
    prisma.event.findUnique.mockResolvedValue({ id: 'event-1' });
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
    prisma.event.findUnique.mockResolvedValue({ id: 'event-1' });
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
    prisma.event.findUnique.mockResolvedValue({ id: 'event-1' });
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
