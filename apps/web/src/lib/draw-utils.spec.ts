import {
  groupByRound,
  getUniqueTeamsCount,
  getFieldsCount,
  filterByTier,
  getUniquePlayers,
  hasEventPassed,
} from './draw-utils';
import type { Assignment } from '@padel/types';

const player = (id: string): Assignment['teamA'][number] =>
  ({ id, name: `P${id}`, rating: 0, tier: 'MASTERS' }) as unknown as Assignment['teamA'][number];

const assignment = (overrides: Partial<Assignment> = {}): Assignment =>
  ({
    id: 'a1',
    round: 1,
    courtId: 'court-1',
    tier: 'MASTERS',
    teamA: [player('1'), player('2')],
    teamB: [player('3'), player('4')],
    ...overrides,
  }) as Assignment;

describe('groupByRound', () => {
  it('groups assignments by round number', () => {
    const result = groupByRound([
      assignment({ id: 'a', round: 1 }),
      assignment({ id: 'b', round: 2 }),
      assignment({ id: 'c', round: 1 }),
    ]);

    expect(result[1]).toHaveLength(2);
    expect(result[2]).toHaveLength(1);
  });

  it('returns an empty object for an empty input', () => {
    expect(groupByRound([])).toEqual({});
  });
});

describe('getUniqueTeamsCount', () => {
  it('treats teams as unordered pairs (player A+B == player B+A)', () => {
    const count = getUniqueTeamsCount([
      assignment({
        id: 'a',
        teamA: [player('1'), player('2')],
        teamB: [player('3'), player('4')],
      }),
      assignment({
        id: 'b',
        teamA: [player('2'), player('1')], // same pair, reversed
        teamB: [player('5'), player('6')],
      }),
    ]);

    // Unique teams: {1,2}, {3,4}, {5,6} = 3
    expect(count).toBe(3);
  });

  it('returns 0 for empty input', () => {
    expect(getUniqueTeamsCount([])).toBe(0);
  });
});

describe('getFieldsCount', () => {
  it('counts unique courts regardless of duplicate assignments per court', () => {
    expect(
      getFieldsCount([
        assignment({ id: 'a', courtId: 'c1' }),
        assignment({ id: 'b', courtId: 'c2' }),
        assignment({ id: 'c', courtId: 'c1' }),
      ])
    ).toBe(2);
  });
});

describe('filterByTier', () => {
  it('keeps only assignments matching the tier', () => {
    const mixed = [
      assignment({ id: 'a', tier: 'MASTERS' }),
      assignment({ id: 'b', tier: 'EXPLORERS' }),
      assignment({ id: 'c', tier: 'MASTERS' }),
    ];
    expect(filterByTier(mixed, 'MASTERS')).toHaveLength(2);
    expect(filterByTier(mixed, 'EXPLORERS')).toHaveLength(1);
  });
});

describe('getUniquePlayers', () => {
  it('deduplicates players that appear across multiple assignments', () => {
    const result = getUniquePlayers([
      assignment({
        id: 'a',
        teamA: [player('1'), player('2')],
        teamB: [player('3'), player('4')],
      }),
      assignment({
        id: 'b',
        teamA: [player('1'), player('5')],
        teamB: [player('6'), player('2')],
      }),
    ]);

    expect(result.map((p) => p.id).sort()).toEqual(['1', '2', '3', '4', '5', '6']);
  });
});

describe('hasEventPassed', () => {
  const fixedNow = new Date('2026-06-15T12:00:00Z');

  beforeEach(() => jest.useFakeTimers().setSystemTime(fixedNow));
  afterEach(() => jest.useRealTimers());

  it('returns true for a date strictly before now', () => {
    expect(hasEventPassed('2026-06-14T00:00:00Z')).toBe(true);
  });

  it('returns false for a date in the future', () => {
    expect(hasEventPassed('2030-01-01T00:00:00Z')).toBe(false);
  });

  it('accepts Date inputs as well as ISO strings', () => {
    expect(hasEventPassed(new Date('2000-01-01'))).toBe(true);
  });
});
