import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthFetch } from './use-api';

export interface PlayerRecord {
  id: string;
  email: string;
  name: string | null;
  profilePhoto: string | null;
  emailVerified: boolean;
  createdAt: string;
  player: {
    id: string;
    rating: number;
    tier: string;
    status: string;
    createdAt: string;
  } | null;
  invitation?: {
    id: string;
    status: string;
    expiresAt: string;
    invitedBy: string;
    invitedByUser?: { id: string; name: string | null; email: string };
    token: string;
    usedAt: string | null;
  } | null;
}

export interface PublicPlayerProfile {
  id: string;
  name: string | null;
  profilePhoto: string | null;
  rating: number;
  tier: string;
  status: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  recentMatches?: Array<{
    id: string;
    date: string;
    result: 'WIN' | 'LOSS' | 'TIE';
    setsWon: number;
    setsLost: number;
    partner?: { id: string; name: string | null; profilePhoto: string | null };
    opponents?: Array<{ id: string; name: string | null; profilePhoto: string | null }>;
  }>;
  rankingHistory?: Array<{ date: string; rating: number }>;
}

/**
 * Hook to fetch all players
 */
export function usePlayers() {
  const authFetch = useAuthFetch();

  return useQuery<PlayerRecord[]>({
    queryKey: ['players'],
    queryFn: () => authFetch.get('/players'),
  });
}

/**
 * Hook to fetch a single player by ID
 */
export function usePlayer(playerId: string) {
  const authFetch = useAuthFetch();

  return useQuery<PublicPlayerProfile>({
    queryKey: ['player', playerId],
    queryFn: () => authFetch.get(`/players/${playerId}`),
  });
}

/**
 * Hook to delete a player
 */
export function useDeletePlayer(playerId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();

  return useMutation({
    mutationFn: async () => {
      return authFetch.delete(`/players/${playerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success('Player deleted successfully');
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete player');
    },
  });
}
