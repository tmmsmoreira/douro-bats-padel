'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayerNav } from './player-nav';
import { Footer } from '@/components/footer';
import { cn } from '@/lib/utils';
import { MapPin, Calendar, Clock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Player {
  id: string;
  name: string;
  rating: number;
  tier: string;
}

interface WaitlistedPlayer extends Player {
  position: number;
}

interface Assignment {
  id: string;
  round: number;
  courtId: string;
  tier: string;
  court?: {
    id: string;
    label: string;
  };
  teamA: Player[];
  teamB: Player[];
}

interface Draw {
  id: string;
  eventId: string;
  event: {
    id: string;
    title: string;
    date: string;
    startsAt: string;
    endsAt: string;
    venue?: {
      id: string;
      name: string;
      courts: Array<{
        id: string;
        label: string;
      }>;
    };
    tierRules?: {
      mastersTimeSlot?: {
        startsAt: string;
        endsAt: string;
        courtIds?: string[];
      };
      explorersTimeSlot?: {
        startsAt: string;
        endsAt: string;
        courtIds?: string[];
      };
    };
  };
  assignments: Assignment[];
}

export function DrawView({ eventId }: { eventId: string }) {
  const { data: session } = useSession();

  const {
    data: draw,
    isLoading,
    error,
  } = useQuery<Draw>({
    queryKey: ['draw', eventId],
    queryFn: async () => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }
      const res = await fetch(`${API_URL}/draws/events/${eventId}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch draw');
      return res.json();
    },
    retry: false, // Don't retry if draw doesn't exist
    enabled: !!session, // Only run query when session is available
  });

  // Fetch event data to get waitlist
  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }
      const res = await fetch(`${API_URL}/events/${eventId}`, { headers });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!session,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PlayerNav />
        <main className="container mx-auto px-4 py-8 flex-1 max-w-7xl">
          <div className="text-center py-8">Loading draw...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !draw) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PlayerNav />
        <main className="container mx-auto px-4 py-8 flex-1 max-w-7xl">
          <div className="text-center py-8">
            <p className="text-lg font-medium">Draw not available yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              The draw will be published once the event organizers have finalized the teams.
            </p>
            {error && (
              <p className="text-xs text-red-500 mt-2">
                Error: {error instanceof Error ? error.message : 'Failed to load draw'}
              </p>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Extract all unique teams (duplas)
  const teamsMap = new Map<string, Player[]>();
  draw.assignments.forEach((assignment) => {
    const teamAKey = assignment.teamA
      .map((p) => p.id)
      .sort()
      .join('-');
    const teamBKey = assignment.teamB
      .map((p) => p.id)
      .sort()
      .join('-');

    if (!teamsMap.has(teamAKey)) {
      teamsMap.set(teamAKey, assignment.teamA);
    }
    if (!teamsMap.has(teamBKey)) {
      teamsMap.set(teamBKey, assignment.teamB);
    }
  });
  const teams = Array.from(teamsMap.values());

  // Group assignments by tier and round
  const masterAssignments = draw.assignments.filter((a) => a.tier === 'MASTERS');
  const explorerAssignments = draw.assignments.filter((a) => a.tier === 'EXPLORERS');

  // Group by round
  const groupByRound = (assignments: Assignment[]) => {
    return assignments.reduce((acc: Record<number, Assignment[]>, assignment) => {
      if (!acc[assignment.round]) {
        acc[assignment.round] = [];
      }
      acc[assignment.round].push(assignment);
      return acc;
    }, {});
  };

  const masterRounds = groupByRound(masterAssignments);
  const explorerRounds = groupByRound(explorerAssignments);

  // Helper to get team display name
  const getTeamName = (team: Player[]) => {
    return team.map((p) => p.name).join(' / ');
  };

  // Helper to get team color based on tier
  const getTeamColor = (tier: string) => {
    return tier === 'MASTERS'
      ? 'bg-yellow-100 dark:bg-yellow-900/30'
      : 'bg-green-100 dark:bg-green-900/30';
  };

  const mastersTimeSlot = draw.event.tierRules?.mastersTimeSlot;
  const explorersTimeSlot = draw.event.tierRules?.explorersTimeSlot;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PlayerNav />
      <main className="container mx-auto px-4 py-8 flex-1 max-w-7xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">{draw.event.title || 'Game Draw'}</h1>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(draw.event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              {draw.event.venue && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{draw.event.venue.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Duplas (Teams) */}
          <Card>
            <CardHeader className="bg-blue-50 dark:bg-blue-950/30">
              <CardTitle>Duplas</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {teams.map((team, index) => {
                  const tier = team[0]?.tier || 'EXPLORERS';
                  return (
                    <div key={index} className={cn('p-3 rounded-lg border-2', getTeamColor(tier))}>
                      <div className="font-medium text-sm">
                        {team.map((player, pIndex) => (
                          <div key={player.id}>
                            {player.name}
                            {pIndex < team.length - 1 && ' / '}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Masters Tier Matches */}
          {Object.keys(masterRounds).length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Padeleiras - Masters</h2>
                {mastersTimeSlot && (
                  <Badge variant="outline" className="text-base px-4 py-1">
                    <Clock className="mr-2 h-4 w-4" /> {mastersTimeSlot.startsAt} -{' '}
                    {mastersTimeSlot.endsAt}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Nota: 25 minutos cada jogo, 2 minutos para troca
              </p>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border p-2 text-left font-semibold"></th>
                          <th className="border p-2 text-left font-semibold">Campo</th>
                          <th className="border p-2 text-left font-semibold">Dupla A</th>
                          <th className="border p-2 text-center font-semibold w-16">Sets A</th>
                          <th className="border p-2 text-center font-semibold w-16">vs</th>
                          <th className="border p-2 text-center font-semibold w-16">Sets B</th>
                          <th className="border p-2 text-left font-semibold">Dupla B</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(masterRounds)
                          .sort(([a], [b]) => Number(a) - Number(b))
                          .map(([round, assignments]) =>
                            assignments.map((assignment, idx) => (
                              <tr key={assignment.id} className="hover:bg-muted/50">
                                {idx === 0 && (
                                  <td
                                    className="border p-2 font-semibold bg-gray-100 dark:bg-gray-800"
                                    rowSpan={assignments.length}
                                  >
                                    Ronda {round}
                                  </td>
                                )}
                                <td className="border p-2">
                                  {assignment.court?.label || `Campo ${assignment.courtId}`}
                                </td>
                                <td className={cn('border p-2', getTeamColor('MASTERS'))}>
                                  {getTeamName(assignment.teamA)}
                                </td>
                                <td className="border p-2 text-center">-</td>
                                <td className="border p-2 text-center font-semibold">vs</td>
                                <td className="border p-2 text-center">-</td>
                                <td className={cn('border p-2', getTeamColor('MASTERS'))}>
                                  {getTeamName(assignment.teamB)}
                                </td>
                              </tr>
                            ))
                          )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Explorers Tier Matches */}
          {Object.keys(explorerRounds).length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Padeleiras - Explorers</h2>
                {explorersTimeSlot && (
                  <Badge variant="outline" className="text-base px-4 py-1">
                    <Clock className="mr-2 h-4 w-4" /> {explorersTimeSlot.startsAt} -{' '}
                    {explorersTimeSlot.endsAt}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Nota: 25 minutos cada jogo, 2 minutos para troca
              </p>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border p-2 text-left font-semibold"></th>
                          <th className="border p-2 text-left font-semibold">Campo</th>
                          <th className="border p-2 text-left font-semibold">Dupla A</th>
                          <th className="border p-2 text-center font-semibold w-16">Sets A</th>
                          <th className="border p-2 text-center font-semibold w-16">vs</th>
                          <th className="border p-2 text-center font-semibold w-16">Sets B</th>
                          <th className="border p-2 text-left font-semibold">Dupla B</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(explorerRounds)
                          .sort(([a], [b]) => Number(a) - Number(b))
                          .map(([round, assignments]) =>
                            assignments.map((assignment, idx) => (
                              <tr key={assignment.id} className="hover:bg-muted/50">
                                {idx === 0 && (
                                  <td
                                    className="border p-2 font-semibold bg-gray-100 dark:bg-gray-800"
                                    rowSpan={assignments.length}
                                  >
                                    Ronda {round}
                                  </td>
                                )}
                                <td className="border p-2">
                                  {assignment.court?.label || `Campo ${assignment.courtId}`}
                                </td>
                                <td className={cn('border p-2', getTeamColor('EXPLORERS'))}>
                                  {getTeamName(assignment.teamA)}
                                </td>
                                <td className="border p-2 text-center">-</td>
                                <td className="border p-2 text-center font-semibold">vs</td>
                                <td className="border p-2 text-center">-</td>
                                <td className={cn('border p-2', getTeamColor('EXPLORERS'))}>
                                  {getTeamName(assignment.teamB)}
                                </td>
                              </tr>
                            ))
                          )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Waitlist Section */}
          {event && event.waitlistedPlayers && event.waitlistedPlayers.length > 0 && (
            <Card>
              <CardHeader className="bg-amber-50 dark:bg-amber-950/30">
                <CardTitle>Lista de Espera ({event.waitlistedPlayers.length})</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  {event.waitlistedPlayers.map((player: WaitlistedPlayer) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">#{player.position}</Badge>
                        <span>{player.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{player.rating}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
