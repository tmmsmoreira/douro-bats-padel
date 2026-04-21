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

  it('throws NotFoundException when the event is missing', async () => {
    prisma.event.findUnique.mockResolvedValue(null);
    await expect(service.update('missing', { title: 'x' })).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it('replaces court associations when courtIds are provided', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'e1',
      state: EventState.DRAFT,
      endsAt: new Date('2099-01-01'),
      capacity: 16,
      rsvps: [],
    });
    prisma.eventCourt.deleteMany.mockResolvedValue({ count: 3 });
    prisma.eventCourt.createMany.mockResolvedValue({ count: 2 });

    await service.update('e1', { courtIds: ['c1', 'c2'] });

    expect(prisma.eventCourt.deleteMany).toHaveBeenCalledWith({ where: { eventId: 'e1' } });
    expect(prisma.eventCourt.createMany).toHaveBeenCalledWith({
      data: [
        { eventId: 'e1', courtId: 'c1' },
        { eventId: 'e1', courtId: 'c2' },
      ],
    });
  });

  it('validates tier rules on update when tierRules is provided', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'e1',
      state: EventState.DRAFT,
      endsAt: new Date('2099-01-01'),
      capacity: 16,
      rsvps: [],
    });

    await expect(service.update('e1', { tierRules: { masterCount: 4 } as any })).rejects.toThrow(
      /MASTERS time slot is required/
    );
  });

  it('converts string dates to Date objects before writing', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'e1',
      state: EventState.DRAFT,
      endsAt: new Date('2099-01-01'),
      capacity: 16,
      rsvps: [],
    });

    await service.update('e1', {
      date: '2026-07-10T00:00:00Z',
      startsAt: '2026-07-10T20:00:00Z',
    } as any);

    const call = prisma.event.update.mock.calls[0][0];
    expect(call.data.date).toBeInstanceOf(Date);
    expect(call.data.startsAt).toBeInstanceOf(Date);
    expect(call.data.endsAt).toBeUndefined();
  });
});

describe('EventsService.create — persistence', () => {
  let prisma: PrismaMock;
  let service: EventsService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new EventsService(prisma as any, { announceEventOpen: jest.fn() } as any);
    prisma.event.create.mockResolvedValue({ id: 'new-event' });
  });

  it('persists the event in DRAFT state with nested eventCourts', async () => {
    await service.create(validCreateDto() as any, 'creator-id');

    const call = prisma.event.create.mock.calls[0][0];
    expect(call.data.state).toBe(EventState.DRAFT);
    expect(call.data.title).toBe('Test Event');
    expect(call.data.eventCourts.create).toEqual([{ courtId: 'court-1' }, { courtId: 'court-2' }]);
    // include pulls venue + eventCourts so the controller can echo it straight back
    expect(call.include).toEqual(
      expect.objectContaining({
        venue: true,
        eventCourts: expect.objectContaining({ include: { court: true } }),
      })
    );
  });

  it('defaults format to NON_STOP when not provided', async () => {
    const dto = validCreateDto() as any;
    delete dto.format;

    await service.create(dto, 'u');

    expect(prisma.event.create.mock.calls[0][0].data.format).toBe('NON_STOP');
  });
});

describe('EventsService.findAll', () => {
  let prisma: PrismaMock;
  let service: EventsService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new EventsService(prisma as any, { announceEventOpen: jest.fn() } as any);
  });

  it('returns [] without any follow-up queries when there are no events', async () => {
    prisma.event.findMany.mockResolvedValue([]);

    expect(await service.findAll()).toEqual([]);
    expect(prisma.rSVP.groupBy).not.toHaveBeenCalled();
  });

  it('applies from/to date filter and excludes DRAFT state for public users', async () => {
    prisma.event.findMany.mockResolvedValue([]);
    const from = new Date('2026-05-01');
    const to = new Date('2026-06-01');

    await service.findAll(from, to);

    const where = prisma.event.findMany.mock.calls[0][0].where;
    expect(where.date).toEqual({ gte: from, lte: to });
    expect(where.state.in).toEqual([
      EventState.OPEN,
      EventState.FROZEN,
      EventState.DRAWN,
      EventState.PUBLISHED,
    ]);
  });

  it('omits the state filter when includeUnpublished=true (admin view)', async () => {
    prisma.event.findMany.mockResolvedValue([]);

    await service.findAll(undefined, undefined, undefined, true);

    expect(prisma.event.findMany.mock.calls[0][0].where.state).toBeUndefined();
  });

  it('aggregates CONFIRMED and WAITLISTED RSVP counts per event', async () => {
    prisma.event.findMany.mockResolvedValue([
      {
        id: 'e1',
        title: 'Event 1',
        date: new Date(),
        startsAt: new Date(),
        endsAt: new Date(),
        capacity: 16,
        state: EventState.OPEN,
        rsvpOpensAt: new Date(),
        rsvpClosesAt: new Date(),
        venue: { id: 'v1', name: 'Venue' },
      },
    ]);
    prisma.rSVP.groupBy.mockResolvedValue([
      { eventId: 'e1', status: 'CONFIRMED', _count: 12 },
      { eventId: 'e1', status: 'WAITLISTED', _count: 3 },
    ] as any);

    const [event] = await service.findAll();

    expect(event.confirmedCount).toBe(12);
    expect(event.waitlistCount).toBe(3);
    expect(event.venue).toEqual({ id: 'v1', name: 'Venue' });
  });

  it('attaches the userRSVP when the logged-in user has a player profile', async () => {
    prisma.event.findMany.mockResolvedValue([
      {
        id: 'e1',
        title: '',
        date: new Date(),
        startsAt: new Date(),
        endsAt: new Date(),
        capacity: 16,
        state: EventState.OPEN,
        rsvpOpensAt: new Date(),
        rsvpClosesAt: new Date(),
        venue: null,
      },
    ]);
    prisma.rSVP.groupBy.mockResolvedValue([]);
    prisma.playerProfile.findUnique.mockResolvedValue({ id: 'p1' });
    prisma.rSVP.findMany.mockResolvedValue([
      { eventId: 'e1', status: 'CONFIRMED', position: 0 },
    ] as any);

    const [event] = await service.findAll(undefined, undefined, 'user-1');

    expect(event.userRSVP).toEqual({ status: 'CONFIRMED', position: 0 });
  });

  it('skips the user-RSVP lookup when the user has no player profile', async () => {
    prisma.event.findMany.mockResolvedValue([
      {
        id: 'e1',
        title: '',
        date: new Date(),
        startsAt: new Date(),
        endsAt: new Date(),
        capacity: 16,
        state: EventState.OPEN,
        rsvpOpensAt: new Date(),
        rsvpClosesAt: new Date(),
        venue: null,
      },
    ]);
    prisma.rSVP.groupBy.mockResolvedValue([]);
    prisma.playerProfile.findUnique.mockResolvedValue(null);

    const [event] = await service.findAll(undefined, undefined, 'user-no-player');

    expect(event.userRSVP).toBeUndefined();
    expect(prisma.rSVP.findMany).not.toHaveBeenCalled();
  });

  it('returns userRSVP=undefined for events the user has not RSVPed to', async () => {
    prisma.event.findMany.mockResolvedValue([
      {
        id: 'e1',
        title: '',
        date: new Date(),
        startsAt: new Date(),
        endsAt: new Date(),
        capacity: 16,
        state: EventState.OPEN,
        rsvpOpensAt: new Date(),
        rsvpClosesAt: new Date(),
        venue: null,
      },
      {
        id: 'e2',
        title: '',
        date: new Date(),
        startsAt: new Date(),
        endsAt: new Date(),
        capacity: 16,
        state: EventState.OPEN,
        rsvpOpensAt: new Date(),
        rsvpClosesAt: new Date(),
        venue: null,
      },
    ]);
    prisma.rSVP.groupBy.mockResolvedValue([]);
    prisma.playerProfile.findUnique.mockResolvedValue({ id: 'p1' });
    prisma.rSVP.findMany.mockResolvedValue([
      { eventId: 'e1', status: 'CONFIRMED', position: 0 },
    ] as any);

    const result = await service.findAll(undefined, undefined, 'user-1');
    expect(result[0].userRSVP).toBeDefined();
    expect(result[1].userRSVP).toBeUndefined();
  });
});

describe('EventsService.findOne', () => {
  let prisma: PrismaMock;
  let service: EventsService;

  const baseEvent = (overrides: Partial<any> = {}) => ({
    id: 'e1',
    title: 'Event',
    date: new Date('2026-06-10'),
    startsAt: new Date(),
    endsAt: new Date(),
    capacity: 16,
    state: EventState.OPEN,
    venue: { id: 'v1', name: 'V', courts: [] },
    eventCourts: [],
    rsvps: [],
    ...overrides,
  });

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new EventsService(prisma as any, { announceEventOpen: jest.fn() } as any);
  });

  it('throws NotFoundException when the event is missing', async () => {
    prisma.event.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('hides DRAFT events from non-admin users (404)', async () => {
    prisma.event.findUnique.mockResolvedValue(baseEvent({ state: EventState.DRAFT }));

    await expect(service.findOne('e1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lets admins see DRAFT events (includeUnpublished=true)', async () => {
    prisma.event.findUnique.mockResolvedValue(baseEvent({ state: EventState.DRAFT }));

    const result = await service.findOne('e1', undefined, true);
    expect(result.state).toBe(EventState.DRAFT);
  });

  it('maps confirmedPlayers and waitlistedPlayers from rsvps', async () => {
    prisma.event.findUnique.mockResolvedValue(
      baseEvent({
        rsvps: [
          {
            status: 'CONFIRMED',
            position: 0,
            player: {
              id: 'p1',
              userId: 'u1',
              rating: 300,
              user: { name: 'Alice', profilePhoto: null },
            },
          },
          {
            status: 'WAITLISTED',
            position: 0,
            player: {
              id: 'p2',
              userId: 'u2',
              rating: 250,
              user: { name: 'Bob', profilePhoto: 'b.jpg' },
            },
          },
        ],
      })
    );

    const result = await service.findOne('e1');

    expect(result.confirmedCount).toBe(1);
    expect(result.waitlistCount).toBe(1);
    expect(result.confirmedPlayers).toEqual([
      { id: 'p1', name: 'Alice', rating: 300, profilePhoto: null },
    ]);
    expect(result.waitlistedPlayers).toEqual([
      { id: 'p2', name: 'Bob', position: 0, rating: 250, profilePhoto: 'b.jpg' },
    ]);
  });

  it('returns userRSVP when the requesting user has an RSVP on the event', async () => {
    prisma.event.findUnique.mockResolvedValue(
      baseEvent({
        rsvps: [
          {
            status: 'CONFIRMED',
            position: 0,
            player: {
              id: 'p1',
              userId: 'user-1',
              rating: 0,
              user: { name: '', profilePhoto: null },
            },
          },
        ],
      })
    );

    const result = await service.findOne('e1', 'user-1');
    expect(result.userRSVP).toEqual({ status: 'CONFIRMED', position: 0 });
  });
});

describe('EventsService.publish — notifications', () => {
  let prisma: PrismaMock;
  let service: EventsService;
  let notificationService: { announceEventOpen: jest.Mock };

  beforeEach(() => {
    prisma = createPrismaMock();
    notificationService = { announceEventOpen: jest.fn().mockResolvedValue(undefined) };
    service = new EventsService(prisma as any, notificationService as any);
  });

  it('announces the open event to active players with email and unpaused notifications', async () => {
    prisma.event.findUnique.mockResolvedValue({ id: 'e1', state: EventState.DRAFT });
    prisma.event.update.mockResolvedValue({ id: 'e1', state: EventState.OPEN });
    prisma.playerProfile.findMany.mockResolvedValue([
      { id: 'p1', user: { id: 'u1', email: 'alice@x.com' } },
      { id: 'p2', user: { id: 'u2', email: 'bob@x.com' } },
    ]);

    await service.publish('e1');

    // The Prisma filter already excludes empty emails / paused notifications —
    // verify the service hands those recipients to the notification layer.
    expect(notificationService.announceEventOpen).toHaveBeenCalledWith(
      [
        { email: 'alice@x.com', userId: 'u1' },
        { email: 'bob@x.com', userId: 'u2' },
      ],
      expect.objectContaining({ id: 'e1' })
    );
  });

  it('still publishes successfully when the notification send throws', async () => {
    prisma.event.findUnique.mockResolvedValue({ id: 'e1', state: EventState.DRAFT });
    prisma.event.update.mockResolvedValue({ id: 'e1', state: EventState.OPEN });
    prisma.playerProfile.findMany.mockRejectedValue(new Error('db blip'));

    await expect(service.publish('e1')).resolves.toMatchObject({ state: EventState.OPEN });
  });
});

describe('EventsService.remove', () => {
  let prisma: PrismaMock;
  let service: EventsService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new EventsService(prisma as any, { announceEventOpen: jest.fn() } as any);
  });

  it('deletes the event and returns a success message', async () => {
    prisma.event.findUnique.mockResolvedValue({ id: 'e1' });
    prisma.event.delete.mockResolvedValue({});

    const result = await service.remove('e1');

    expect(prisma.event.delete).toHaveBeenCalledWith({ where: { id: 'e1' } });
    expect(result).toEqual({ message: 'Event deleted successfully' });
  });

  it('throws NotFoundException when the event is missing', async () => {
    prisma.event.findUnique.mockResolvedValue(null);

    await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.event.delete).not.toHaveBeenCalled();
  });
});
