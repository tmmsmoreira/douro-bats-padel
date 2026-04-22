import type { LeaderboardEntry, EventWithRSVP, EventWithPlayersSerialized } from '@padel/types';
import type { PlayerRecord, PublicPlayerProfile } from '@/hooks/use-players';

export interface UserProfileShape {
  id: string;
  email: string;
  name: string | null;
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
  profilePhoto: string | null;
  roles: string[];
  emailVerified: boolean;
  createdAt: string;
  player: {
    id: string;
    rating: number;
    tier: string;
    status: string;
    notificationsPaused: boolean;
    createdAt: string;
  } | null;
}

export const queries = {
  profile: (accessToken: string | undefined) => ({
    queryKey: ['profile', accessToken] as const,
    path: '/auth/me',
  }),
  leaderboard: () => ({
    queryKey: ['leaderboard'] as const,
    path: '/rankings/leaderboard',
  }),
  players: () => ({
    queryKey: ['players'] as const,
    path: '/players',
  }),
  player: (playerId: string) => ({
    queryKey: ['player', playerId] as const,
    path: `/players/${playerId}`,
  }),
  event: (eventId: string) => ({
    queryKey: ['event', eventId] as const,
    path: `/events/${eventId}`,
  }),
  upcomingEvents: (roleKey: string, fromIso: string) => ({
    queryKey: ['events', roleKey, fromIso, undefined] as const,
    path: `/events?from=${encodeURIComponent(fromIso)}`,
  }),
  pastEvents: (roleKey: string, toIso: string) => ({
    queryKey: ['past-events', roleKey, undefined, toIso] as const,
    path: `/events?to=${encodeURIComponent(toIso)}`,
  }),
  adminEvents: (roleKey: string) => ({
    queryKey: ['admin-events', roleKey, undefined, undefined] as const,
    path: '/events',
  }),
  venues: () => ({
    queryKey: ['venues'] as const,
    path: '/venues',
  }),
  venue: (venueId: string) => ({
    queryKey: ['venue', venueId] as const,
    path: `/venues/${venueId}`,
  }),
};

export function rolesToRoleKey(roles: string[] | undefined | null): string {
  return (roles ?? []).slice().sort().join(',') || 'anon';
}

export type UserProfile = UserProfileShape;
export type LeaderboardData = LeaderboardEntry[];
export type PlayersData = PlayerRecord[];
export type PlayerData = PublicPlayerProfile;
export type EventData = EventWithPlayersSerialized;
export type EventsData = EventWithRSVP[];
