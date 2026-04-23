import { DrawController } from './draw.controller';

const makeDrawServiceMock = () => ({
  generateDraw: jest.fn(),
  getDraw: jest.fn(),
  updateAssignment: jest.fn(),
  publishDraw: jest.fn(),
  unpublishDraw: jest.fn(),
  deleteDraw: jest.fn(),
});

describe('DrawController', () => {
  let drawService: ReturnType<typeof makeDrawServiceMock>;
  let controller: DrawController;

  beforeEach(() => {
    drawService = makeDrawServiceMock();
    controller = new DrawController(drawService as any);
  });

  it('generateDraw passes eventId, user.sub, constraints, and selectedCourts', async () => {
    drawService.generateDraw.mockResolvedValue({ id: 'draw-1' });

    const body = {
      constraints: { avoidRecentSessions: 4, balanceStrength: true },
      selectedCourts: { masters: ['c1'], explorers: ['c2'] },
    };

    await controller.generateDraw(
      'event-1',
      body as any,
      {
        user: { sub: 'creator-id' },
      } as any
    );

    expect(drawService.generateDraw).toHaveBeenCalledWith(
      'event-1',
      'creator-id',
      body.constraints,
      body.selectedCourts
    );
  });

  it('generateDraw passes undefined for optional fields when missing', async () => {
    drawService.generateDraw.mockResolvedValue({});

    await controller.generateDraw('event-1', {} as any, { user: { sub: 'u1' } } as any);

    expect(drawService.generateDraw).toHaveBeenCalledWith('event-1', 'u1', undefined, undefined);
  });

  it('getDraw forwards the full user object so the service can check roles', async () => {
    drawService.getDraw.mockResolvedValue({});
    const user = { sub: 'u1', roles: ['ADMIN'] };

    await controller.getDraw('event-1', { user } as any);

    expect(drawService.getDraw).toHaveBeenCalledWith('event-1', user);
  });

  it('updateAssignment forwards ids and the editor user.sub for audit logging', async () => {
    drawService.updateAssignment.mockResolvedValue({});

    await controller.updateAssignment('assign-1', { teamA: ['p1', 'p2'], teamB: ['p3', 'p4'] }, {
      user: { sub: 'editor-1' },
    } as any);

    expect(drawService.updateAssignment).toHaveBeenCalledWith(
      'assign-1',
      ['p1', 'p2'],
      ['p3', 'p4'],
      'editor-1'
    );
  });

  it.each([
    ['publishDraw', 'publishDraw'],
    ['unpublishDraw', 'unpublishDraw'],
    ['deleteDraw', 'deleteDraw'],
  ] as const)(
    '%s delegates to the matching service method',
    async (controllerMethod, serviceMethod) => {
      (drawService as any)[serviceMethod].mockResolvedValue({});

      await (controller as any)[controllerMethod]('event-1');

      expect((drawService as any)[serviceMethod]).toHaveBeenCalledWith('event-1');
    }
  );
});
