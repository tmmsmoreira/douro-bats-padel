export interface MatchTeamPlayer {
  id: string;
  name: string;
  rating?: number;
  ratingDelta?: number;
  profilePhoto?: string | null;
}

export interface MatchWithTeams {
  id: string;
  eventId?: string;
  courtId: string;
  court?: { label: string };
  round: number;
  setsA: number;
  setsB: number;
  tier: string;
  publishedAt?: string | null;
  teamA?: MatchTeamPlayer[];
  teamB?: MatchTeamPlayer[];
}
