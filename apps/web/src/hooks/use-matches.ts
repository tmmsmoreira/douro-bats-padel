import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthFetch } from './use-api';

export interface MatchResultData {
  eventId: string;
  courtId: string;
  round: number;
  setsA: number;
  setsB: number;
  tier?: string;
}

/**
 * Hook to save multiple match results
 */
export function useSaveMatchResults(eventId: string) {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();

  return useMutation({
    mutationFn: async (results: MatchResultData[]) => {
      // Save all results in parallel
      return Promise.all(results.map((result) => authFetch.post('/matches', result)));
    },
    onSuccess: async (_, results) => {
      // Invalidate matches cache
      await queryClient.invalidateQueries({ queryKey: ['matches', eventId] });

      toast.success(
        `Results saved successfully (${results.length} ${results.length === 1 ? 'match' : 'matches'})`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save results');
    },
  });
}

export interface Match {
  id: string;
  eventId?: string;
  courtId: string;
  court?: { label: string };
  round: number;
  setsA: number;
  setsB: number;
  tier: string;
  publishedAt?: string | null;
  teamA?: Array<{
    id: string;
    name: string;
    rating?: number;
    ratingDelta?: number;
    profilePhoto?: string | null;
  }>;
  teamB?: Array<{
    id: string;
    name: string;
    rating?: number;
    ratingDelta?: number;
    profilePhoto?: string | null;
  }>;
}

/**
 * Hook to fetch matches for an event
 */
export function useEventMatches(eventId: string) {
  const authFetch = useAuthFetch();

  return useQuery<Match[]>({
    queryKey: ['matches', eventId],
    queryFn: () => authFetch.get(`/matches/events/${eventId}`),
    retry: false,
  });
}

/**
 * Hook to recompute rankings after corrections to published matches
 */
export function useRecomputeRankings(eventId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();

  return useMutation({
    mutationFn: async () => {
      return authFetch.post(`/rankings/recompute/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches', eventId] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast.success('Rankings recomputed');
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to recompute rankings');
    },
  });
}

/**
 * Hook to publish match results for an event
 */
export function usePublishMatches(eventId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();

  return useMutation({
    mutationFn: async () => {
      return authFetch.post(`/matches/events/${eventId}/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches', eventId] });
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast.success('Results published successfully');
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to publish results');
    },
  });
}
