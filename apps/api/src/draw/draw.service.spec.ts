import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DrawService } from './draw.service';
import { createPrismaMock, type PrismaMock } from '../../test/prisma-mock';
import { EventState, Tier } from '@padel/types';

/**
 * Tests for the draw pipeline. We mock Prisma so these are fast unit tests,
 * and focus on:
 *   - Event state-machine guards
 *   - Tier-split math (masterCount / masterPercentage / default)
 *   - Court-capacity overflow pushing extra confirmed players to waitlist
 *   - Determinism: same seed → same teams/matches
 *   - Business invariants: round numbers start at 1 per tier, every player is
 *     in exactly one team per match
 */

type AnyObj = Record<string, unknown>;

const buildCourts = (ids: string[]) =>
  ids.map((id) => ({ id, name: `Court ${id}`, venueId: 'venue-1' }));

const buildRSVP = (i: number, rating: number): AnyObj => ({
  id: `rsvp-${i}`,
  status: 'CONFIRMED',
  position: 0,
  player: {
    id: `player-${i}`,
    rating,
    user: { id: `user-${i}`, name: `Player ${i}`, email: `p${i}@example.com` },
  },
});

const buildEvent = (overrides: Partial<AnyObj> = {}): AnyObj => ({
  id: 'event-1',
  state: EventState.FROZEN,
  endsAt: new Date('2099-01-01T22:00:00Z'), // far future
  tierRules: {
    mastersTimeSlot: { startsAt: '20:00', endsAt: '21:30', courtIds: ['court-1', 'court-2'] },
    explorersTimeSlot: { startsAt: '21:30', endsAt: '23:00', courtIds: ['court-3', 'court-4'] },
  },
  venue: {
    id: 'venue-1',
    courts: buildCourts(['court-1', 'court-2', 'court-3', 'court-4']),
  },
  rsvps: Array.from({ length: 16 }, (_, i) => buildRSVP(i + 1, 1000 - i * 10)),
  ...overrides,
});

describe('DrawService.generateDraw', () => {
  let prisma: PrismaMock;
  let service: DrawService;
  let notificationService: { sendDrawPublished: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(() => {
    prisma = createPrismaMock();
    notificationService = { sendDrawPublished: jest.fn().mockResolvedValue(undefined) };
    configService = { get: jest.fn() };

    // The draw transaction creates a draw, updates the event, and (optionally)
    // demotes overflow RSVPs to the waitlist. Return a stable shape so assertions
    // can inspect the payloads sent to Prisma.
    prisma.draw.create.mockResolvedValue({ id: 'draw-1', assignments: [] });
    prisma.event.update.mockResolvedValue({});
    prisma.rSVP.update.mockResolvedValue({});
    prisma.rSVP.findMany.mockResolvedValue([]);

    // Recent-history + previous-week lookups (keep constraints-affecting defaults empty)
    prisma.event.findMany.mockResolvedValue([]);
    prisma.event.findFirst.mockResolvedValue(null);

    service = new DrawService(prisma as any, configService as any, notificationService as any);
  });

  describe('state-machine guards', () => {
    it('throws NotFoundException when the event does not exist', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(service.generateDraw('missing', 'user-1')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('rejects generating a draw for a past event', async () => {
      prisma.event.findUnique.mockResolvedValue(
        buildEvent({ endsAt: new Date('2000-01-01T00:00:00Z') })
      );

      await expect(service.generateDraw('event-1', 'user-1')).rejects.toThrow(/past event/i);
    });

    it('rejects generating a draw when the event is DRAFT', async () => {
      prisma.event.findUnique.mockResolvedValue(buildEvent({ state: EventState.DRAFT }));

      await expect(service.generateDraw('event-1', 'user-1')).rejects.toThrow(
        /frozen before generating draw/i
      );
    });

    it('accepts OPEN or FROZEN events', async () => {
      prisma.event.findUnique.mockResolvedValue(buildEvent({ state: EventState.OPEN }));

      const result = await service.generateDraw('event-1', 'user-1');
      expect(result).toBeDefined();
    });

    it('rejects when the event has fewer than 4 confirmed players', async () => {
      prisma.event.findUnique.mockResolvedValue(
        buildEvent({ rsvps: [buildRSVP(1, 1000), buildRSVP(2, 900), buildRSVP(3, 800)] })
      );

      await expect(service.generateDraw('event-1', 'user-1')).rejects.toThrow(
        /at least 4 players/i
      );
    });

    it('rejects when no courts are configured in tier time slots', async () => {
      prisma.event.findUnique.mockResolvedValue(
        buildEvent({
          tierRules: {
            mastersTimeSlot: { startsAt: '20:00', endsAt: '21:30', courtIds: [] },
            explorersTimeSlot: { startsAt: '21:30', endsAt: '23:00', courtIds: [] },
          },
        })
      );

      await expect(service.generateDraw('event-1', 'user-1')).rejects.toThrow(
        /No courts available in tier time slots/i
      );
    });

    it('throws BadRequest when tierRules is malformed (not an object)', async () => {
      prisma.event.findUnique.mockResolvedValue(buildEvent({ tierRules: 42 }));

      await expect(service.generateDraw('event-1', 'user-1')).rejects.toBeInstanceOf(
        BadRequestException
      );
    });
  });

  describe('tier split math', () => {
    it('splits 50/50 by default (rounded down to a multiple of 4 per tier)', async () => {
      prisma.event.findUnique.mockResolvedValue(buildEvent());

      await service.generateDraw('event-1', 'user-1');

      const createArg = prisma.draw.create.mock.calls[0][0];
      const assignments = createArg.data.assignments.create as Array<{
        teamA: string[];
        teamB: string[];
        tier: string;
      }>;
      const mastersAssignments = assignments.filter((a) => a.tier === Tier.MASTERS);
      const explorersAssignments = assignments.filter((a) => a.tier === Tier.EXPLORERS);

      const mastersPlayers = new Set<string>();
      mastersAssignments.forEach((a) => {
        a.teamA.forEach((id) => mastersPlayers.add(id));
        a.teamB.forEach((id) => mastersPlayers.add(id));
      });
      const explorersPlayers = new Set<string>();
      explorersAssignments.forEach((a) => {
        a.teamA.forEach((id) => explorersPlayers.add(id));
        a.teamB.forEach((id) => explorersPlayers.add(id));
      });

      expect(mastersPlayers.size).toBe(8);
      expect(explorersPlayers.size).toBe(8);
    });

    it('honors tierRules.masterCount when set', async () => {
      prisma.event.findUnique.mockResolvedValue(
        buildEvent({
          tierRules: {
            masterCount: 4,
            mastersTimeSlot: { startsAt: '20:00', endsAt: '21:30', courtIds: ['c1', 'c2'] },
            explorersTimeSlot: { startsAt: '21:30', endsAt: '23:00', courtIds: ['c3', 'c4'] },
          },
          venue: { id: 'venue-1', courts: buildCourts(['c1', 'c2', 'c3', 'c4']) },
        })
      );

      await service.generateDraw('event-1', 'user-1');

      const assignments = prisma.draw.create.mock.calls[0][0].data.assignments.create as Array<{
        tier: string;
        teamA: string[];
        teamB: string[];
      }>;
      const mastersPlayers = new Set<string>();
      assignments
        .filter((a) => a.tier === Tier.MASTERS)
        .forEach((a) => [...a.teamA, ...a.teamB].forEach((id) => mastersPlayers.add(id)));

      expect(mastersPlayers.size).toBe(4);
    });

    it('assigns top-rated players to MASTERS', async () => {
      prisma.event.findUnique.mockResolvedValue(buildEvent());

      await service.generateDraw('event-1', 'user-1');

      const assignments = prisma.draw.create.mock.calls[0][0].data.assignments.create as Array<{
        tier: string;
        teamA: string[];
        teamB: string[];
      }>;
      const mastersPlayers = new Set<string>();
      assignments
        .filter((a) => a.tier === Tier.MASTERS)
        .forEach((a) => [...a.teamA, ...a.teamB].forEach((id) => mastersPlayers.add(id)));

      // Top 8 by rating were players 1..8 (ratings 1000, 990, ..., 930)
      for (let i = 1; i <= 8; i++) {
        expect(mastersPlayers.has(`player-${i}`)).toBe(true);
      }
    });
  });

  describe('seed determinism', () => {
    it('produces the same team assignments when called twice with the same seed', async () => {
      prisma.event.findUnique.mockResolvedValue(buildEvent());

      await service.generateDraw('event-1', 'user-1', undefined, undefined, 'fixed-seed-123');
      const first = prisma.draw.create.mock.calls[0][0].data.assignments.create;

      prisma.draw.create.mockClear();
      prisma.event.update.mockClear();
      prisma.event.findUnique.mockResolvedValue(buildEvent());

      await service.generateDraw('event-1', 'user-1', undefined, undefined, 'fixed-seed-123');
      const second = prisma.draw.create.mock.calls[0][0].data.assignments.create;

      expect(first).toEqual(second);
    });

    it('persists the generated seed on the event record', async () => {
      prisma.event.findUnique.mockResolvedValue(buildEvent());

      await service.generateDraw('event-1', 'user-1', undefined, undefined, 'fixed-seed-xyz');

      expect(prisma.event.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ seed: 'fixed-seed-xyz', state: EventState.DRAWN }),
        })
      );
    });
  });

  describe('capacity overflow → waitlist', () => {
    it('moves excess confirmed players to WAITLISTED when there are more players than seats', async () => {
      // 20 confirmed players, but courts support only 16 (4 × 4 players)
      prisma.event.findUnique.mockResolvedValue(
        buildEvent({
          rsvps: Array.from({ length: 20 }, (_, i) => buildRSVP(i + 1, 1000 - i * 10)),
        })
      );
      prisma.rSVP.findMany.mockResolvedValue([]); // no existing waitlist

      await service.generateDraw('event-1', 'user-1');

      // Excess = 20 - 16 = 4
      expect(prisma.rSVP.update).toHaveBeenCalledTimes(4);
      const calls = prisma.rSVP.update.mock.calls;
      calls.forEach(([arg]) => {
        expect(arg.data.status).toBe('WAITLISTED');
        expect(typeof arg.data.position).toBe('number');
      });
      // Positions start at 1 when no existing waitlist
      const positions = calls.map(([arg]) => arg.data.position).sort();
      expect(positions).toEqual([1, 2, 3, 4]);
    });

    it('continues the waitlist after the existing max position', async () => {
      prisma.event.findUnique.mockResolvedValue(
        buildEvent({
          rsvps: Array.from({ length: 18 }, (_, i) => buildRSVP(i + 1, 1000 - i * 10)),
        })
      );
      // Existing waitlist max position is 7 → overflow players get 8, 9
      prisma.rSVP.findMany.mockResolvedValue([{ position: 7 }]);

      await service.generateDraw('event-1', 'user-1');

      const positions = prisma.rSVP.update.mock.calls.map(([arg]) => arg.data.position).sort();
      expect(positions).toEqual([8, 9]);
    });
  });

  describe('every player appears in exactly one team per match (invariant)', () => {
    it('does not duplicate or omit players across masters teams', async () => {
      prisma.event.findUnique.mockResolvedValue(buildEvent());

      await service.generateDraw('event-1', 'user-1');

      const assignments = prisma.draw.create.mock.calls[0][0].data.assignments.create as Array<{
        round: number;
        tier: string;
        teamA: string[];
        teamB: string[];
      }>;

      // For each (round, tier), each player appears at most once
      const grouped = new Map<string, Array<(typeof assignments)[number]>>();
      for (const a of assignments) {
        const key = `${a.tier}-${a.round}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(a);
      }

      for (const [, matchesInRound] of grouped) {
        const seen = new Set<string>();
        for (const a of matchesInRound) {
          for (const id of [...a.teamA, ...a.teamB]) {
            expect(seen.has(id)).toBe(false);
            seen.add(id);
          }
        }
      }

      // And rounds are 1-indexed per tier
      const mastersRounds = new Set(
        assignments.filter((a) => a.tier === Tier.MASTERS).map((a) => a.round)
      );
      expect(Math.min(...mastersRounds)).toBe(1);
    });

    it('teamA and teamB always contain 2 distinct players each', async () => {
      prisma.event.findUnique.mockResolvedValue(buildEvent());

      await service.generateDraw('event-1', 'user-1');

      const assignments = prisma.draw.create.mock.calls[0][0].data.assignments.create as Array<{
        teamA: string[];
        teamB: string[];
      }>;

      for (const a of assignments) {
        expect(a.teamA).toHaveLength(2);
        expect(a.teamB).toHaveLength(2);
        expect(a.teamA[0]).not.toBe(a.teamA[1]);
        expect(a.teamB[0]).not.toBe(a.teamB[1]);
        // teamA and teamB are disjoint
        expect(a.teamA.some((id) => a.teamB.includes(id))).toBe(false);
      }
    });
  });
});

describe('DrawService.publishDraw', () => {
  let prisma: PrismaMock;
  let service: DrawService;
  let notificationService: { sendDrawPublished: jest.Mock };

  beforeEach(() => {
    prisma = createPrismaMock();
    notificationService = { sendDrawPublished: jest.fn().mockResolvedValue(undefined) };
    service = new DrawService(prisma as any, { get: jest.fn() } as any, notificationService as any);
  });

  it('rejects publishing when no draw exists', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'event-1',
      endsAt: new Date('2099-01-01'),
      state: EventState.FROZEN,
      draws: [],
      rsvps: [],
    });

    await expect(service.publishDraw('event-1')).rejects.toThrow(/no draw generated/i);
  });

  it('rejects publishing for a past event', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'event-1',
      endsAt: new Date('2000-01-01'),
      state: EventState.DRAWN,
      draws: [{ id: 'draw-1' }],
      rsvps: [],
    });

    await expect(service.publishDraw('event-1')).rejects.toThrow(/past event/i);
  });

  it('transitions the event to PUBLISHED and fires notifications', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'event-1',
      endsAt: new Date('2099-01-01'),
      state: EventState.DRAWN,
      draws: [{ id: 'draw-1' }],
      rsvps: [
        {
          player: { user: { id: 'u1', email: 'p1@example.com', name: 'P1' } },
        },
      ],
    });
    prisma.event.update.mockResolvedValue({});

    await service.publishDraw('event-1');

    expect(prisma.event.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { state: EventState.PUBLISHED } })
    );
    expect(notificationService.sendDrawPublished).toHaveBeenCalledTimes(1);
  });
});
