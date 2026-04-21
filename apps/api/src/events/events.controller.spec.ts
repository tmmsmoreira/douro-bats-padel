import { EventsController } from './events.controller';
import { Role } from '@padel/types';

const makeEventsServiceMock = () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  publish: jest.fn(),
  freeze: jest.fn(),
  unfreeze: jest.fn(),
  remove: jest.fn(),
});

const makeRsvpServiceMock = () => ({
  handleRSVP: jest.fn(),
  autoPromoteWaitlist: jest.fn(),
  removePlayerFromEvent: jest.fn(),
});

describe('EventsController', () => {
  let eventsService: ReturnType<typeof makeEventsServiceMock>;
  let rsvpService: ReturnType<typeof makeRsvpServiceMock>;
  let controller: EventsController;

  beforeEach(() => {
    eventsService = makeEventsServiceMock();
    rsvpService = makeRsvpServiceMock();
    controller = new EventsController(eventsService as any, rsvpService as any);
  });

  describe('findAll — isAdminOrEditor flag', () => {
    it('passes includeUnpublished=true for admin users', async () => {
      eventsService.findAll.mockResolvedValue([]);
      const req = { user: { sub: 'u1', roles: [Role.ADMIN], email: 'a@x' } } as any;

      await controller.findAll(req);

      expect(eventsService.findAll).toHaveBeenCalledWith(undefined, undefined, 'u1', true);
    });

    it('passes includeUnpublished=true for editor users', async () => {
      eventsService.findAll.mockResolvedValue([]);
      const req = { user: { sub: 'u1', roles: [Role.EDITOR], email: 'e@x' } } as any;

      await controller.findAll(req);

      expect(eventsService.findAll).toHaveBeenCalledWith(undefined, undefined, 'u1', true);
    });

    it('passes includeUnpublished=false for viewer users', async () => {
      eventsService.findAll.mockResolvedValue([]);
      const req = { user: { sub: 'u1', roles: [Role.VIEWER], email: 'v@x' } } as any;

      await controller.findAll(req);

      expect(eventsService.findAll).toHaveBeenCalledWith(undefined, undefined, 'u1', false);
    });

    it('passes includeUnpublished=false for anonymous requests and userId=undefined', async () => {
      eventsService.findAll.mockResolvedValue([]);

      await controller.findAll({} as any);

      expect(eventsService.findAll).toHaveBeenCalledWith(undefined, undefined, undefined, false);
    });

    it('parses the from/to query strings into Date objects', async () => {
      eventsService.findAll.mockResolvedValue([]);

      await controller.findAll({} as any, '2026-01-01', '2026-12-31');

      const [fromArg, toArg] = eventsService.findAll.mock.calls[0];
      expect(fromArg).toBeInstanceOf(Date);
      expect(toArg).toBeInstanceOf(Date);
      expect((fromArg as Date).toISOString()).toMatch(/^2026-01-01/);
    });
  });

  describe('findOne — role-based unpublished access', () => {
    it('forwards isAdminOrEditor=true for admins', async () => {
      eventsService.findOne.mockResolvedValue({});
      await controller.findOne('event-1', {
        user: { sub: 'u1', roles: [Role.ADMIN] },
      } as any);

      expect(eventsService.findOne).toHaveBeenCalledWith('event-1', 'u1', true);
    });

    it('forwards isAdminOrEditor=false for viewers', async () => {
      eventsService.findOne.mockResolvedValue({});
      await controller.findOne('event-1', {
        user: { sub: 'u1', roles: [Role.VIEWER] },
      } as any);

      expect(eventsService.findOne).toHaveBeenCalledWith('event-1', 'u1', false);
    });
  });

  describe('mutating endpoints', () => {
    it('create passes DTO and user.sub through', async () => {
      eventsService.create.mockResolvedValue({ id: 'e1' });
      const dto = { title: 'New' } as any;

      await controller.create(dto, { user: { sub: 'creator-id' } } as any);

      expect(eventsService.create).toHaveBeenCalledWith(dto, 'creator-id');
    });

    it('update passes id and DTO', async () => {
      eventsService.update.mockResolvedValue({});

      await controller.update('event-1', { title: 'Updated' } as any);

      expect(eventsService.update).toHaveBeenCalledWith('event-1', { title: 'Updated' });
    });

    it.each([
      ['publish', 'publish'],
      ['freeze', 'freeze'],
      ['unfreeze', 'unfreeze'],
    ] as const)(
      '%s delegates to the matching service method',
      async (controllerMethod, serviceMethod) => {
        (eventsService as any)[serviceMethod].mockResolvedValue({});

        await (controller as any)[controllerMethod]('event-1');

        expect((eventsService as any)[serviceMethod]).toHaveBeenCalledWith('event-1');
      }
    );

    it('remove delegates to events.remove', async () => {
      eventsService.remove.mockResolvedValue({ message: 'deleted' });

      await controller.remove('event-1');

      expect(eventsService.remove).toHaveBeenCalledWith('event-1');
    });
  });

  describe('rsvp endpoints', () => {
    it('rsvp passes eventId, user.sub, and DTO to the RSVPService', async () => {
      rsvpService.handleRSVP.mockResolvedValue({});

      await controller.rsvp(
        'event-1',
        { status: 'IN' } as any,
        {
          user: { sub: 'player-user' },
        } as any
      );

      expect(rsvpService.handleRSVP).toHaveBeenCalledWith('event-1', 'player-user', {
        status: 'IN',
      });
    });

    it('promoteWaitlist delegates to RSVPService.autoPromoteWaitlist', async () => {
      rsvpService.autoPromoteWaitlist.mockResolvedValue({ promoted: 2 });

      await controller.promoteWaitlist('event-1');

      expect(rsvpService.autoPromoteWaitlist).toHaveBeenCalledWith('event-1');
    });

    it('removePlayerFromEvent passes both eventId and playerId', async () => {
      rsvpService.removePlayerFromEvent.mockResolvedValue({});

      await controller.removePlayerFromEvent('event-1', 'player-1');

      expect(rsvpService.removePlayerFromEvent).toHaveBeenCalledWith('event-1', 'player-1');
    });
  });
});
