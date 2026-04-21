import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventsService } from './events.service';
import { createPrismaMock, type PrismaMock } from '../../test/prisma-mock';
import { EventState } from '@padel/types';

const validTierRules = () => ({
  masterCount: 4,
  mastersTimeSlot: { startsAt: '20:00', endsAt: '21:30', courtIds: ['court-1'] },
  explorersTimeSlot: { startsAt: '21:30', endsAt: '23:00', courtIds: ['court-2'] },
});

const validCreateDto = () => ({
  title: 'Test Event',
  date: '2026-07-10T00:00:00Z',
  startsAt: '2026-07-10T20:00:00Z',
  endsAt: '2026-07-10T23:00:00Z',
  venueId: 'venue-1',
  courtIds: ['court-1', 'court-2'],
  capacity: 16,
  rsvpOpensAt: '2026-07-01T00:00:00Z',
  rsvpClosesAt: '2026-07-09T00:00:00Z',
  tierRules: validTierRules(),
});

describe('EventsService.create — tier rule validation', () => {
  let prisma: PrismaMock;
  let service: EventsService;
  let notificationService: { announceEventOpen: jest.Mock };

  beforeEach(() => {
    prisma = createPrismaMock();
    notificationService = { announceEventOpen: jest.fn() };
    service = new EventsService(prisma as any, notificationService as any);
    prisma.event.create.mockResolvedValue({ id: 'new-event' });
  });

  it('creates an event when tier rules are valid', async () => {
    await expect(service.create(validCreateDto() as any, 'creator-id')).resolves.toBeDefined();
  });

  it('rejects when tierRules is missing entirely', async () => {
    await expect(
      service.create({ ...(validCreateDto() as any), tierRules: undefined }, 'u')
    ).rejects.toThrow(/Tier rules are required/);
  });

  it('rejects when both masterCount and masterPercentage are set', async () => {
    await expect(
      service.create(
        {
          ...(validCreateDto() as any),
          tierRules: { ...validTierRules(), masterPercentage: 50 },
        },
        'u'
      )
    ).rejects.toThrow(/Cannot specify both/);
  });

  it('rejects a negative masterCount', async () => {
    await expect(
      service.create(
        {
          ...(validCreateDto() as any),
          tierRules: { ...validTierRules(), masterCount: -1 },
        },
        'u'
      )
    ).rejects.toThrow(/non-negative integer/);
  });

  it('rejects a non-integer masterCount', async () => {
    await expect(
      service.create(
        {
          ...(validCreateDto() as any),
          tierRules: { ...validTierRules(), masterCount: 2.5 },
        },
        'u'
      )
    ).rejects.toThrow(/non-negative integer/);
  });

  it('rejects a masterCount that exceeds event capacity', async () => {
    await expect(
      service.create(
        {
          ...(validCreateDto() as any),
          capacity: 8,
          tierRules: { ...validTierRules(), masterCount: 12 },
        },
        'u'
      )
    ).rejects.toThrow(/cannot exceed event capacity/);
  });

  it('rejects masterPercentage outside 0–100', async () => {
    const dto = validCreateDto() as any;
    delete dto.tierRules.masterCount;

    await expect(
      service.create({ ...dto, tierRules: { ...dto.tierRules, masterPercentage: 150 } }, 'u')
    ).rejects.toThrow(/between 0 and 100/);
  });

  it('rejects malformed time formats', async () => {
    await expect(
      service.create(
        {
          ...(validCreateDto() as any),
          tierRules: {
            ...validTierRules(),
            mastersTimeSlot: { startsAt: '8pm', endsAt: '21:30', courtIds: ['c1'] },
          },
        },
        'u'
      )
    ).rejects.toThrow(/Invalid MASTERS start time format/);
  });

  it('rejects when a tier time slot has no courts assigned', async () => {
    await expect(
      service.create(
        {
          ...(validCreateDto() as any),
          tierRules: {
            ...validTierRules(),
            explorersTimeSlot: { startsAt: '21:30', endsAt: '23:00', courtIds: [] },
          },
        },
        'u'
      )
    ).rejects.toThrow(/EXPLORERS time slot must have at least one court/);
  });

  it('accepts 00:00 and 23:59 as valid boundary times', async () => {
    await expect(
      service.create(
        {
          ...(validCreateDto() as any),
          tierRules: {
            ...validTierRules(),
            mastersTimeSlot: { startsAt: '00:00', endsAt: '23:59', courtIds: ['c1'] },
          },
        },
        'u'
      )
    ).resolves.toBeDefined();
  });

  it('rejects hour >= 24', async () => {
    await expect(
      service.create(
        {
          ...(validCreateDto() as any),
          tierRules: {
            ...validTierRules(),
            mastersTimeSlot: { startsAt: '24:00', endsAt: '21:30', courtIds: ['c1'] },
          },
        },
        'u'
      )
    ).rejects.toThrow(/Invalid MASTERS start time format/);
  });
});

describe('EventsService — state transitions', () => {
  let prisma: PrismaMock;
  let service: EventsService;
  let notificationService: { announceEventOpen: jest.Mock };

  beforeEach(() => {
    prisma = createPrismaMock();
    notificationService = { announceEventOpen: jest.fn().mockResolvedValue(undefined) };
    service = new EventsService(prisma as any, notificationService as any);
  });

  describe('publish (DRAFT → OPEN)', () => {
    it('transitions DRAFT events to OPEN', async () => {
      prisma.event.findUnique.mockResolvedValue({ id: 'e1', state: EventState.DRAFT });
      prisma.event.update.mockResolvedValue({ id: 'e1', state: EventState.OPEN });
      prisma.playerProfile.findMany.mockResolvedValue([]);

      await service.publish('e1');

      expect(prisma.event.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { state: EventState.OPEN } })
      );
    });

    it('rejects when event is not in DRAFT', async () => {
      prisma.event.findUnique.mockResolvedValue({ id: 'e1', state: EventState.OPEN });

      await expect(service.publish('e1')).rejects.toThrow(/not in draft state/);
    });

    it('throws NotFoundException when the event is missing', async () => {
      prisma.event.findUnique.mockResolvedValue(null);
      await expect(service.publish('x')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('freeze (OPEN → FROZEN)', () => {
    it('transitions OPEN → FROZEN', async () => {
      prisma.event.findUnique.mockResolvedValue({ id: 'e1', state: EventState.OPEN });
      prisma.event.update.mockResolvedValue({});

      await service.freeze('e1');

      expect(prisma.event.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { state: EventState.FROZEN } })
      );
    });

    it('rejects freezing a DRAFT event', async () => {
      prisma.event.findUnique.mockResolvedValue({ id: 'e1', state: EventState.DRAFT });
      await expect(service.freeze('e1')).rejects.toThrow(/Only open events can be frozen/);
    });
  });

  describe('unfreeze (FROZEN → OPEN)', () => {
    it('transitions back to OPEN when no draw exists', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'e1',
        state: EventState.FROZEN,
        draws: [],
      });
      prisma.event.update.mockResolvedValue({});

      await service.unfreeze('e1');

      expect(prisma.event.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { state: EventState.OPEN } })
      );
    });

    it('refuses to unfreeze when a draw already exists', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'e1',
        state: EventState.FROZEN,
        draws: [{ id: 'draw-1' }],
      });

      await expect(service.unfreeze('e1')).rejects.toThrow(
        /Cannot unfreeze event with existing draw/
      );
    });

    it('rejects unfreezing a non-FROZEN event', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'e1',
        state: EventState.OPEN,
        draws: [],
      });
      await expect(service.unfreeze('e1')).rejects.toThrow(/not in frozen state/);
    });
  });
});

describe('EventsService.update — edit guards', () => {
  let prisma: PrismaMock;
  let service: EventsService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new EventsService(prisma as any, { announceEventOpen: jest.fn() } as any);
    prisma.event.update.mockResolvedValue({});
  });

  it('refuses to edit timing fields when the event has confirmed players', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'e1',
      state: EventState.OPEN,
      endsAt: new Date('2099-01-01'),
      capacity: 16,
      rsvps: [{ id: 'r1', status: 'CONFIRMED' }],
    });

    await expect(service.update('e1', { date: '2026-08-10T00:00:00Z' })).rejects.toThrow(
      /Cannot edit event timing/
    );
  });

  it('refuses to edit a past event that was already drawn', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'e1',
      state: EventState.DRAWN,
      endsAt: new Date('2000-01-01'),
      capacity: 16,
      rsvps: [],
    });

    await expect(service.update('e1', { title: 'Renamed' })).rejects.toThrow(
      /Cannot update a past event/
    );
  });

  it('allows editing non-timing fields with confirmed players', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'e1',
      state: EventState.OPEN,
      endsAt: new Date('2099-01-01'),
      capacity: 16,
      rsvps: [{ id: 'r1', status: 'CONFIRMED' }],
    });

    await expect(service.update('e1', { title: 'New Title' })).resolves.toBeDefined();
  });
});
