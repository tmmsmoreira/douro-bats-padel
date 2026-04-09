import { useQuery } from '@tanstack/react-query';
import type { LeaderboardEntry } from '@padel/types';
import { useAuthFetch } from './use-api';

export function useLeaderboard() {
  const authFetch = useAuthFetch();

  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: () => authFetch.get('/rankings/leaderboard'),
  });
}
