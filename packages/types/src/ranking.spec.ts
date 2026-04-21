import { computeRanking, RANKING_POINTS, type MatchResult } from './ranking';
import { Tier } from './common';

const match = (overrides: Partial<MatchResult> = {}): MatchResult => ({
  matchId: 'm1',
  tier: Tier.MASTERS,
  teamA: ['p1', 'p2'],
  teamB: ['p3', 'p4'],
  setsA: 2,
  setsB: 1,
  ...overrides,
});

describe('computeRanking — scoring formula', () => {
  it('MASTERS winner gets (300 + 20·setsWon)/2 each; loser gets (20·setsLost)/2 each', () => {
    const { weeklyScore } = computeRanking({
      currentRatings: { p1: 0, p2: 0, p3: 0, p4: 0 },
      weeklyWindow: [],
      matches: [match({ tier: Tier.MASTERS, setsA: 2, setsB: 1 })],
    });

    // Winner team = 300 + 20·2 = 340 → 170 per player
    // Loser team  =        20·1 = 20  → 10 per player
    // Each player played exactly 1 round → weeklyScore = raw total
    expect(weeklyScore.p1).toBe(170);
    expect(weeklyScore.p2).toBe(170);
    expect(weeklyScore.p3).toBe(10);
    expect(weeklyScore.p4).toBe(10);
  });

  it('EXPLORERS winner gets (200 + 15·setsWon)/2 each; loser gets (15·setsLost)/2 each', () => {
    const { weeklyScore } = computeRanking({
      currentRatings: { p1: 0, p2: 0, p3: 0, p4: 0 },
      weeklyWindow: [],
      matches: [match({ tier: Tier.EXPLORERS, setsA: 3, setsB: 0 })],
    });

    // Winner = 200 + 15·3 = 245 → 122.5 per player → rounded to 123 via Math.round(total/rounds)
    // Each player plays 1 round, so weeklyScore = round(122.5) = 123 for the winner
    // Loser = 15·0 = 0 → 0 per player
    expect(weeklyScore.p1).toBe(123);
    expect(weeklyScore.p2).toBe(123);
    expect(weeklyScore.p3).toBe(0);
    expect(weeklyScore.p4).toBe(0);
  });

  it('ties award only perSet points, halved across team members, no base', () => {
    const { weeklyScore } = computeRanking({
      currentRatings: { p1: 0, p2: 0, p3: 0, p4: 0 },
      weeklyWindow: [],
      matches: [match({ tier: Tier.MASTERS, setsA: 2, setsB: 2 })],
    });

    // Per side: 20·2 = 40 → 20 per player. No base points.
    expect(weeklyScore.p1).toBe(20);
    expect(weeklyScore.p2).toBe(20);
    expect(weeklyScore.p3).toBe(20);
    expect(weeklyScore.p4).toBe(20);
  });

  it('identifies the winner by setsA > setsB vs setsB > setsA (not hard-coded to teamA)', () => {
    const { weeklyScore } = computeRanking({
      currentRatings: { p1: 0, p2: 0, p3: 0, p4: 0 },
      weeklyWindow: [],
      matches: [match({ tier: Tier.MASTERS, setsA: 1, setsB: 3 })],
    });

    // teamB wins — base should go to p3/p4, not p1/p2
    expect(weeklyScore.p3).toBe(180); // (300 + 20·3)/2 = 180
    expect(weeklyScore.p4).toBe(180);
    expect(weeklyScore.p1).toBe(10); // 20·1/2 = 10
    expect(weeklyScore.p2).toBe(10);
  });
});

describe('computeRanking — weekly score averages over rounds played', () => {
  it('averages total points across all rounds a player played', () => {
    const { weeklyScore } = computeRanking({
      currentRatings: { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0 },
      weeklyWindow: [],
      matches: [
        // Round 1: p1 wins (Masters) 2–0 → winnerTeam = 300 + 40 = 340 → p1 gets 170
        match({
          matchId: 'r1',
          tier: Tier.MASTERS,
          setsA: 2,
          setsB: 0,
          teamA: ['p1', 'p2'],
          teamB: ['p3', 'p4'],
        }),
        // Round 2: p1 loses (Masters) 1–2 → loserTeam = 20·1 = 20 → p1 gets 10
        match({
          matchId: 'r2',
          tier: Tier.MASTERS,
          setsA: 1,
          setsB: 2,
          teamA: ['p1', 'p5'],
          teamB: ['p2', 'p3'],
        }),
      ],
    });

    // p1 total = 170 + 10 = 180 across 2 rounds → round(180/2) = 90
    expect(weeklyScore.p1).toBe(90);
  });

  it('rounds half-values using Math.round (half up for positive values)', () => {
    const { weeklyScore } = computeRanking({
      currentRatings: { p1: 0, p2: 0, p3: 0, p4: 0 },
      weeklyWindow: [],
      matches: [match({ tier: Tier.EXPLORERS, setsA: 3, setsB: 0 })],
    });

    // Winner raw = 122.5 → rounds to 123
    expect(weeklyScore.p1).toBe(123);
  });

  it('assigns weeklyScore = 0 to players in currentRatings who played no matches', () => {
    const { weeklyScore } = computeRanking({
      currentRatings: { p1: 100, p2: 200, ghost: 150 },
      weeklyWindow: [],
      matches: [
        match({ tier: Tier.MASTERS, setsA: 2, setsB: 0, teamA: ['p1', 'p2'], teamB: ['p3', 'p4'] }),
      ],
    });

    expect(weeklyScore.ghost).toBe(0);
  });
});

describe('computeRanking — 5-week moving average', () => {
  it('averages only non-zero weeks including the current week', () => {
    const { newRatings } = computeRanking({
      currentRatings: { p1: 0, p2: 0, p3: 0, p4: 0 },
      // Oldest → newest: weeks -4, -3, -2, -1
      weeklyWindow: [{ p1: 100 }, { p1: 200 }, { p1: 0 }, { p1: 150 }],
      matches: [
        // Current week: p1 wins Masters → 170
        match({ tier: Tier.MASTERS, setsA: 2, setsB: 0, teamA: ['p1', 'p2'], teamB: ['p3', 'p4'] }),
      ],
    });

    // Non-zero series: [100, 200, 150, 170] → avg = 155
    expect(newRatings.p1).toBe(155);
  });

  it('keeps current rating when the player has all-zero weekly scores', () => {
    const { newRatings } = computeRanking({
      currentRatings: { idle: 275 },
      weeklyWindow: [{}, {}, {}, {}],
      matches: [],
    });

    expect(newRatings.idle).toBe(275);
  });

  it('falls back to 0 when there is no rating history and no matches', () => {
    const { newRatings } = computeRanking({
      currentRatings: {},
      weeklyWindow: [],
      matches: [],
    });

    expect(newRatings).toEqual({});
  });

  it('rounds averaged rating using Math.round', () => {
    const { newRatings } = computeRanking({
      currentRatings: { p1: 0 },
      // Only one non-zero series value: the current-week score
      weeklyWindow: [{}, {}, {}, {}],
      matches: [
        match({
          tier: Tier.EXPLORERS,
          setsA: 3,
          setsB: 0,
          teamA: ['p1', 'p2'],
          teamB: ['p3', 'p4'],
        }),
      ],
    });

    // Current week = 123 (Explorers winner) → newRating = 123
    expect(newRatings.p1).toBe(123);
  });
});

describe('computeRanking — edge cases', () => {
  it('handles empty match list without throwing', () => {
    expect(() =>
      computeRanking({ currentRatings: {}, weeklyWindow: [], matches: [] })
    ).not.toThrow();
  });

  it('returns weekly scores for players only present in matches (not in currentRatings)', () => {
    const { weeklyScore } = computeRanking({
      currentRatings: {},
      weeklyWindow: [],
      matches: [match({ tier: Tier.MASTERS, setsA: 2, setsB: 0 })],
    });

    expect(weeklyScore.p1).toBe(170);
    expect(weeklyScore.p2).toBe(170);
  });

  it('RANKING_POINTS constants match documented business rules', () => {
    expect(RANKING_POINTS.MASTERS).toEqual({ base: 300, perSet: 20 });
    expect(RANKING_POINTS.EXPLORERS).toEqual({ base: 200, perSet: 15 });
  });

  it('splits points equally between the two players on a team', () => {
    const { weeklyScore } = computeRanking({
      currentRatings: {},
      weeklyWindow: [],
      matches: [match({ tier: Tier.MASTERS, setsA: 2, setsB: 1 })],
    });

    expect(weeklyScore.p1).toBe(weeklyScore.p2);
    expect(weeklyScore.p3).toBe(weeklyScore.p4);
  });
});
