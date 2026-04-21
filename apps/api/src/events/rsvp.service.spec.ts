import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RSVPService } from './rsvp.service';
import { createPrismaMock, type PrismaMock } from '../../test/prisma-mock';
import { RSVPStatus } from '@padel/types';

type MockNotifications = {
  sendRSVPConfirmation: jest.Mock;
  sendWaitlistNotification: jest.Mock;
  sendPromotionNotification: jest.Mock;
};

const buildEvent = (overrides: Partial<any> = {}) => ({
  id: 'event-1',
  capacity: 8,
  rsvpOpensAt: new Date('2026-01-01T00:00:00Z'),
  rsvpClosesAt: new Date('2026-12-31T00:00:00Z'),
  state: 'OPEN',
  rsvps: [],
  ...overrides,
});

const buildPlayer = (overrides: Partial<any> = {}) => ({
  id: 'player-1',
  userId: 'user-1',
  rating: 0,
  status: 'ACTIVE',
  user: { id: 'user-1', email: 'p1@example.com', name: 'Player One' },
  ...overrides,
});

describe('RSVPService', () => {
  let prisma: PrismaMock;
  let notifications: MockNotifications;
  let service: RSVPService;

  // Freeze time inside the RSVP window so rsvpOpensAt/rsvpClosesAt checks pass
  // without every test having to fight Date.now().
  const fixedNow = new Date('2026-06-15T12:00:00Z');

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(fixedNow);
    prisma = createPrismaMock();
    notifications = {
      sendRSVPConfirmation: jest.fn().mockResolvedValue(undefined),
      sendWaitlistNotification: jest.fn().mockResolvedValue(undefined),
      sendPromotionNotification: jest.fn().mockResolvedValue(undefined),
    };
    service = new RSVPService(prisma as any, notifications as any);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('handleRSVP — guards', () => {
    it('throws NotFoundException when the event does not exist', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.handleRSVP('missing', 'user-1', { status: 'IN' })
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('blocks RSVPs before the window opens', async () => {
      prisma.event.findUnique.mockResolvedValue(
        buildEvent({ rsvpOpensAt: new Date('2026-12-01T00:00:00Z') })
      );

      await expect(service.handleRSVP('event-1', 'user-1', { status: 'IN' })).rejects.toThrow(
        'RSVP window has not opened yet'
      );
    });

    it('blocks RSVPs after the window closes unless the event is FROZEN', async () => {
      prisma.event.findUnique.mockResolvedValue(
        buildEvent({
          rsvpClosesAt: new Date('2026-01-10T00:00:00Z'),
          state: 'OPEN',
        })
      );

      await expect(service.handleRSVP('event-1', 'user-1', { status: 'IN' })).rejects.toThrow(
        'RSVP window has closed'
      );
    });

    it('allows RSVP after window closes if the event is FROZEN (editor override)', async () => {
      prisma.event.findUnique.mockResolvedValue(
        buildEvent({
          rsvpClosesAt: new Date('2026-01-10T00:00:00Z'),
          state: 'FROZEN',
        })
      );
      prisma.playerProfile.findUnique.mockResolvedValue(buildPlayer());
      prisma.rSVP.count.mockResolvedValue(0);
      prisma.rSVP.upsert.mockResolvedValue({});

      const result = await service.handleRSVP('event-1', 'user-1', { status: 'IN' });

      expect(result.status).toBe(RSVPStatus.CONFIRMED);
    });
  });

  describe('handleRSVP — IN path (FCFS)', () => {
    it('confirms the player when there is capacity', async () => {
      prisma.event.findUnique.mockResolvedValue(buildEvent({ capacity: 8 }));
      prisma.playerProfile.findUnique.mockResolvedValue(buildPlayer());
      prisma.rSVP.count.mockResolvedValue(5);
      prisma.rSVP.upsert.mockResolvedValue({});

      const result = await service.handleRSVP('event-1', 'user-1', { status: 'IN' });

      expect(result.status).toBe(RSVPStatus.CONFIRMED);
      expect(prisma.rSVP.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ status: RSVPStatus.CONFIRMED, position: 0 }),
        })
      );
      expect(notifications.sendRSVPConfirmation).toHaveBeenCalled();
    });

    it('waitlists the player when capacity is full and assigns position = maxPosition + 1', async () => {
      prisma.event.findUnique.mockResolvedValue(buildEvent({ capacity: 4 }));
      prisma.playerProfile.findUnique.mockResolvedValue(buildPlayer());
      prisma.rSVP.count.mockResolvedValue(4);
      prisma.rSVP.aggregate.mockResolvedValue({ _max: { position: 3 } });
      prisma.rSVP.upsert.mockResolvedValue({});

      const result = await service.handleRSVP('event-1', 'user-1', { status: 'IN' });

      expect(result.status).toBe(RSVPStatus.WAITLISTED);
      expect(result.position).toBe(4);
      expect(notifications.sendWaitlistNotification).toHaveBeenCalled();
    });

    it('starts waitlist at position 1 when nobody is waitlisted yet', async () => {
      prisma.event.findUnique.mockResolvedValue(buildEvent({ capacity: 4 }));
      prisma.playerProfile.findUnique.mockResolvedValue(buildPlayer());
      prisma.rSVP.count.mockResolvedValue(4);
      prisma.rSVP.aggregate.mockResolvedValue({ _max: { position: null } });
      prisma.rSVP.upsert.mockResolvedValue({});

      const result = await service.handleRSVP('event-1', 'user-1', { status: 'IN' });

      expect(result.position).toBe(1);
    });

    it('returns CONFIRMED without re-running the transaction when already confirmed', async () => {
      prisma.event.findUnique.mockResolvedValue(
        buildEvent({
          rsvps: [{ playerId: 'player-1', status: RSVPStatus.CONFIRMED }],
        })
      );
      prisma.playerProfile.findUnique.mockResolvedValue(buildPlayer());

      const result = await service.handleRSVP('event-1', 'user-1', { status: 'IN' });

      expect(result.status).toBe(RSVPStatus.CONFIRMED);
      expect(result.message).toMatch(/already confirmed/i);
      // Short-circuit path: no confirmation side-effects
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(prisma.rSVP.upsert).not.toHaveBeenCalled();
      expect(notifications.sendRSVPConfirmation).not.toHaveBeenCalled();
    });

    it('auto-creates a PlayerProfile when the user has none yet', async () => {
      prisma.event.findUnique.mockResolvedValue(buildEvent());
      prisma.playerProfile.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      prisma.playerProfile.create.mockResolvedValue(buildPlayer());
      prisma.rSVP.count.mockResolvedValue(0);
      prisma.rSVP.upsert.mockResolvedValue({});

      await service.handleRSVP('event-1', 'user-1', { status: 'IN' });

      expect(prisma.playerProfile.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: 'user-1', rating: 0, status: 'ACTIVE' }),
        })
      );
    });

    it('reactivates an INACTIVE player when they get confirmed', async () => {
      prisma.event.findUnique.mockResolvedValue(buildEvent());
      prisma.playerProfile.findUnique.mockResolvedValue(buildPlayer({ status: 'INACTIVE' }));
      prisma.rSVP.count.mockResolvedValue(0);
      prisma.rSVP.upsert.mockResolvedValue({});

      await service.handleRSVP('event-1', 'user-1', { status: 'IN' });

      expect(prisma.playerProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'ACTIVE' } })
      );
    });
  });

  describe('handleRSVP — OUT path', () => {
    it('returns DECLINED when the user was never registered', async () => {
      prisma.event.findUnique.mockResolvedValue(buildEvent({ rsvps: [] }));
      prisma.playerProfile.findUnique.mockResolvedValue(buildPlayer());

      const result = await service.handleRSVP('event-1', 'user-1', { status: 'OUT' });

      expect(result.status).toBe(RSVPStatus.DECLINED);
      expect(prisma.rSVP.delete).not.toHaveBeenCalled();
    });

    it('deletes the RSVP and promotes the next waitlisted player when a CONFIRMED player leaves', async () => {
      prisma.event.findUnique.mockResolvedValue(
        buildEvent({
          rsvps: [{ playerId: 'player-1', status: RSVPStatus.CONFIRMED }],
        })
      );
      prisma.playerProfile.findUnique.mockResolvedValue(buildPlayer());
      prisma.rSVP.delete.mockResolvedValue({});
      // promoteNextWaitlisted internals:
      prisma.rSVP.findFirst.mockResolvedValue({
        id: 'rsvp-2',
        playerId: 'player-2',
        player: {
          user: { id: 'user-2', email: 'p2@example.com', name: 'Player Two' },
        },
      });
      prisma.rSVP.update.mockResolvedValue({});
      prisma.rSVP.findMany.mockResolvedValue([]);

      const result = await service.handleRSVP('event-1', 'user-1', { status: 'OUT' });

      expect(result.status).toBe(RSVPStatus.CANCELLED);
      expect(prisma.rSVP.delete).toHaveBeenCalled();
      expect(prisma.rSVP.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: RSVPStatus.CONFIRMED, position: 0 }),
        })
      );
      expect(notifications.sendPromotionNotification).toHaveBeenCalled();
    });

    it('does not promote when a WAITLISTED player cancels', async () => {
      prisma.event.findUnique.mockResolvedValue(
        buildEvent({
          rsvps: [{ playerId: 'player-1', status: RSVPStatus.WAITLISTED }],
        })
      );
      prisma.playerProfile.findUnique.mockResolvedValue(buildPlayer());
      prisma.rSVP.delete.mockResolvedValue({});

      await service.handleRSVP('event-1', 'user-1', { status: 'OUT' });

      expect(prisma.rSVP.findFirst).not.toHaveBeenCalled();
      expect(notifications.sendPromotionNotification).not.toHaveBeenCalled();
    });
  });

  describe('autoPromoteWaitlist', () => {
    it('promotes exactly the number of available spots', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        capacity: 8,
        rsvpClosesAt: new Date('2026-12-31T00:00:00Z'),
      });
      prisma.rSVP.count.mockResolvedValue(6); // 2 spots open
      prisma.rSVP.findMany
        // 1st call: findMany inside autoPromoteWaitlist for players to promote
        .mockResolvedValueOnce([
          {
            id: 'rsvp-a',
            player: { user: { id: 'u-a', email: 'a@x.com', name: 'A' } },
          },
          {
            id: 'rsvp-b',
            player: { user: { id: 'u-b', email: 'b@x.com', name: 'B' } },
          },
        ])
        // 2nd call: reorderWaitlist (no remaining)
        .mockResolvedValueOnce([]);
      prisma.rSVP.update.mockResolvedValue({});

      const result = await service.autoPromoteWaitlist('event-1');

      expect(result.promoted).toBe(2);
      expect(prisma.rSVP.findMany).toHaveBeenNthCalledWith(1, expect.objectContaining({ take: 2 }));
      expect(notifications.sendPromotionNotification).toHaveBeenCalledTimes(2);
    });

    it('returns { promoted: 0 } when no spots are available', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        capacity: 8,
        rsvpClosesAt: new Date('2026-12-31T00:00:00Z'),
      });
      prisma.rSVP.count.mockResolvedValue(8);

      const result = await service.autoPromoteWaitlist('event-1');

      expect(result.promoted).toBe(0);
      expect(prisma.rSVP.findMany).not.toHaveBeenCalled();
    });

    it('rejects auto-promote after the RSVP cutoff', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        capacity: 8,
        rsvpClosesAt: new Date('2026-01-10T00:00:00Z'), // in the past
      });

      await expect(service.autoPromoteWaitlist('event-1')).rejects.toBeInstanceOf(
        BadRequestException
      );
    });
  });
});
