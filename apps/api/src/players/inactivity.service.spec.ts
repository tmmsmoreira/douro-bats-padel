import { InactivityService } from './inactivity.service';
import { createPrismaMock, type PrismaMock } from '../../test/prisma-mock';
import { PlayerStatus } from '@padel/types';

const makeConfig = (threshold?: number) => ({
  get: jest.fn((_key: string, fallback: number) =>
    typeof threshold === 'number' ? threshold : fallback
  ),
});

const activePlayer = (id: string, overrides: Partial<any> = {}) => ({
  id,
  status: PlayerStatus.ACTIVE,
  rsvps: [],
  user: { name: `name-${id}`, email: `${id}@x.com` },
  ...overrides,
});

describe('InactivityService.checkInactivePlayers', () => {
  let prisma: PrismaMock;
  let service: InactivityService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new InactivityService(prisma as any, makeConfig() as any);
  });

  it('skips players with recent RSVPs (no inactivity mark, no assignment lookup)', async () => {
    prisma.playerProfile.findMany.mockResolvedValue([
      activePlayer('p1', { rsvps: [{ id: 'rsvp-1' }] }),
    ]);
    prisma.event.findMany.mockResolvedValue([]);

    await service.checkInactivePlayers();

    expect(prisma.assignment.findFirst).not.toHaveBeenCalled();
    expect(prisma.playerProfile.updateMany).not.toHaveBeenCalled();
  });

  it('marks players INACTIVE when they have no RSVPs and no match participation', async () => {
    prisma.playerProfile.findMany.mockResolvedValue([activePlayer('p1'), activePlayer('p2')]);
    prisma.event.findMany.mockResolvedValue([{ id: 'e1' }]);
    // Neither player has a draw assignment in the threshold window.
    prisma.assignment.findFirst.mockResolvedValue(null);
    prisma.playerProfile.updateMany.mockResolvedValue({ count: 2 });

    await service.checkInactivePlayers();

    expect(prisma.playerProfile.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['p1', 'p2'] } },
      data: { status: PlayerStatus.INACTIVE },
    });
  });

  it('keeps players who participated in a recent match (draw assignment found)', async () => {
    prisma.playerProfile.findMany.mockResolvedValue([activePlayer('p1')]);
    prisma.event.findMany.mockResolvedValue([{ id: 'e1' }]);
    prisma.assignment.findFirst.mockResolvedValue({ id: 'a1' });

    await service.checkInactivePlayers();

    expect(prisma.playerProfile.updateMany).not.toHaveBeenCalled();
  });

  it('marks only the inactive subset when some players are active', async () => {
    prisma.playerProfile.findMany.mockResolvedValue([
      activePlayer('p1', { rsvps: [{ id: 'r' }] }), // recent RSVP → active
      activePlayer('p2'), // no RSVP, no match → inactive
      activePlayer('p3'), // no RSVP, match found → active
    ]);
    prisma.event.findMany.mockResolvedValue([{ id: 'e1' }]);
    prisma.assignment.findFirst
      .mockResolvedValueOnce(null) // p2
      .mockResolvedValueOnce({ id: 'a1' }); // p3
    prisma.playerProfile.updateMany.mockResolvedValue({ count: 1 });

    await service.checkInactivePlayers();

    expect(prisma.playerProfile.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['p2'] } },
      data: { status: PlayerStatus.INACTIVE },
    });
  });

  it('uses the configured threshold days when computing the cutoff date', async () => {
    service = new InactivityService(prisma as any, makeConfig(30) as any);
    prisma.playerProfile.findMany.mockResolvedValue([]);
    prisma.event.findMany.mockResolvedValue([]);

    const before = Date.now();
    await service.checkInactivePlayers();
    const after = Date.now();

    const threshold = prisma.playerProfile.findMany.mock.calls[0][0].include.rsvps.where.createdAt
      .gte as Date;
    // Threshold date should be ~30 days before now.
    const thirtyDaysAgo = new Date(before);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const upperBound = new Date(after);
    upperBound.setDate(upperBound.getDate() - 30);
    expect(threshold.getTime()).toBeGreaterThanOrEqual(thirtyDaysAgo.getTime());
    expect(threshold.getTime()).toBeLessThanOrEqual(upperBound.getTime() + 10);
  });

  it('swallows errors so the cron job does not crash the scheduler', async () => {
    prisma.playerProfile.findMany.mockRejectedValue(new Error('db down'));

    await expect(service.checkInactivePlayers()).resolves.toBeUndefined();
    expect(prisma.playerProfile.updateMany).not.toHaveBeenCalled();
  });

  it('does not issue an updateMany when no inactive players are found', async () => {
    prisma.playerProfile.findMany.mockResolvedValue([activePlayer('p1', { rsvps: [{ id: 'r' }] })]);
    prisma.event.findMany.mockResolvedValue([]);

    await service.checkInactivePlayers();

    expect(prisma.playerProfile.updateMany).not.toHaveBeenCalled();
  });
});

describe('InactivityService.triggerInactivityCheck', () => {
  it('delegates to checkInactivePlayers', async () => {
    const prisma = createPrismaMock();
    const service = new InactivityService(prisma as any, makeConfig() as any);
    const spy = jest.spyOn(service, 'checkInactivePlayers').mockResolvedValue(undefined);

    await service.triggerInactivityCheck();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('InactivityService.reactivatePlayer', () => {
  let prisma: PrismaMock;
  let service: InactivityService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new InactivityService(prisma as any, makeConfig() as any);
  });

  it('flips INACTIVE players to ACTIVE', async () => {
    prisma.playerProfile.findUnique.mockResolvedValue({
      id: 'p1',
      status: PlayerStatus.INACTIVE,
    });
    prisma.playerProfile.update.mockResolvedValue({});

    await service.reactivatePlayer('p1');

    expect(prisma.playerProfile.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { status: PlayerStatus.ACTIVE },
    });
  });

  it('is a no-op when the player is already ACTIVE', async () => {
    prisma.playerProfile.findUnique.mockResolvedValue({
      id: 'p1',
      status: PlayerStatus.ACTIVE,
    });

    await service.reactivatePlayer('p1');

    expect(prisma.playerProfile.update).not.toHaveBeenCalled();
  });

  it('is a no-op when the player does not exist', async () => {
    prisma.playerProfile.findUnique.mockResolvedValue(null);

    await service.reactivatePlayer('missing');

    expect(prisma.playerProfile.update).not.toHaveBeenCalled();
  });
});
