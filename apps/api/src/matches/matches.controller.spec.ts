import { MatchesController } from './matches.controller';
import { Tier } from '@padel/types';

describe('MatchesController', () => {
  let matchesService: {
    submitMatch: jest.Mock;
    publishMatches: jest.Mock;
    getMatches: jest.Mock;
  };
  let controller: MatchesController;

  beforeEach(() => {
    matchesService = {
      submitMatch: jest.fn(),
      publishMatches: jest.fn(),
      getMatches: jest.fn(),
    };
    controller = new MatchesController(matchesService as any);
  });

  it('submitMatch passes the DTO and user.sub as reporter', async () => {
    matchesService.submitMatch.mockResolvedValue({ id: 'm1' });

    const dto = {
      eventId: 'e1',
      courtId: 'c1',
      round: 1,
      setsA: 2,
      setsB: 1,
      tier: Tier.MASTERS,
    };

    await controller.submitMatch(dto, { user: { sub: 'editor-1' } } as any);

    expect(matchesService.submitMatch).toHaveBeenCalledWith(dto, 'editor-1');
  });

  it('publishMatches delegates to the service', async () => {
    matchesService.publishMatches.mockResolvedValue({ count: 3 });

    const result = await controller.publishMatches('event-1');

    expect(matchesService.publishMatches).toHaveBeenCalledWith('event-1');
    expect(result).toEqual({ count: 3 });
  });

  it('getMatches delegates to the service', async () => {
    matchesService.getMatches.mockResolvedValue([]);

    await controller.getMatches('event-1');

    expect(matchesService.getMatches).toHaveBeenCalledWith('event-1');
  });
});
