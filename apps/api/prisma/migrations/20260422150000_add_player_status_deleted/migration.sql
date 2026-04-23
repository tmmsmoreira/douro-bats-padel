-- Extend PlayerStatus with DELETED (GDPR-style soft-delete marker). PII on
-- User is scrubbed when a user is anonymized but PlayerProfile +
-- WeeklyScore + RankingSnapshot rows are preserved so historical leaderboards
-- stay internally consistent. Leaderboard/history queries filter DELETED out.
ALTER TYPE "PlayerStatus" ADD VALUE 'DELETED';
