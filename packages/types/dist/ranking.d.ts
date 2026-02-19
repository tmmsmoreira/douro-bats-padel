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
export declare function computeRanking(i: ComputeInput): ComputeOutput;
/** @deprecated Tier is assigned dynamically per event, not based on rating threshold */
export declare const toTier: (rating: number) => Tier;
export interface LeaderboardEntry {
    playerId: string;
    playerName: string;
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