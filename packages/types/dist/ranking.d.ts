import { Tier } from './common';
export type MatchResult = {
    matchId: string;
    tier: Tier;
    teamA: [string, string];
    teamB: [string, string];
    setsA: number;
    setsB: number;
};
export type ComputeInput = {
    currentRatings: Record<string, number>;
    weeklyWindow: Array<Record<string, number>>;
    matches: MatchResult[];
};
export type ComputeOutput = {
    weeklyScore: Record<string, number>;
    newRatings: Record<string, number>;
};
/**
 * Per-tier scoring table. Source of truth for both the compute function
 * below AND the human-readable rules in Prisma's schema comments.
 *
 * Winner = base + perSet × setsWon
 * Loser  =        perSet × setsWon
 * Tie    = no base, only perSet × sets (halved across team)
 */
export declare const RANKING_POINTS: {
    readonly MASTERS: {
        readonly base: 300;
        readonly perSet: 20;
    };
    readonly EXPLORERS: {
        readonly base: 200;
        readonly perSet: 15;
    };
};
export declare function computeRanking(i: ComputeInput): ComputeOutput;
/** @deprecated Tier is assigned dynamically per event, not based on rating threshold */
export declare const toTier: (rating: number) => Tier;
export interface LeaderboardEntry {
    playerId: string;
    playerName: string;
    profilePhoto?: string | null;
    rating: number;
    tier: Tier;
    delta: number;
    weeklyScores: number[];
}
export interface PlayerHistory {
    playerId: string;
    playerName: string;
    tier: Tier;
    currentRating: number;
    history: Array<{
        weekStart: Date;
        score: number;
        rating: number;
    }>;
}
//# sourceMappingURL=ranking.d.ts.map