'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AlertCircle } from 'lucide-react';
import { DataStateWrapper } from '@/components/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Player {
  id: string;
  name: string;
  rating: number;
  profilePhoto?: string | null;
}

interface Court {
  id: string;
  label: string;
}

interface Match {
  id: string;
  round: number;
  setsA: number;
  setsB: number;
  teamA: Player[];
  teamB: Player[];
  court?: Court;
  courtId?: string;
  tier?: string;
}

export function ResultsView({ eventId }: { eventId: string }) {
  const { data: session } = useSession();
  const t = useTranslations('resultsView');

  const {
    data: matches,
    isLoading,
    error,
  } = useQuery<Match[]>({
    queryKey: ['matches', eventId],
    queryFn: async () => {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }
      const res = await fetch(`${API_URL}/matches/events/${eventId}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch matches');
      return res.json();
    },
    retry: false, // Don't retry if results don't exist
    enabled: !!session,
  });

  return (
    <DataStateWrapper
      isLoading={isLoading}
      data={matches}
      error={error}
      loadingMessage={t('loadingResults')}
      errorComponent={
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{t('resultsNotAvailable')}</EmptyTitle>
            <EmptyDescription>
              {t('resultsNotAvailableDescription')}
              {error && (
                <>
                  <br />
                  <span className="text-xs text-destructive mt-2 block">
                    {t('error')}:{' '}
                    {error instanceof Error ? error.message : 'Failed to load results'}
                  </span>
                </>
              )}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      }
      emptyMessage={t('noResults')}
    >
      {(matches) => <ResultsContent matches={matches} t={t} />}
    </DataStateWrapper>
  );
}

// Component for when there are results
function ResultsContent({
  matches,
  t,
}: {
  matches: Match[];
  t: ReturnType<typeof useTranslations>;
}) {
  // Group by round
  const rounds = matches.reduce(
    (acc: Record<number, Match[]>, match: Match) => {
      if (!acc[match.round]) {
        acc[match.round] = [];
      }
      acc[match.round].push(match);
      return acc;
    },
    {} as Record<number, Match[]>
  );

  return (
    <div className="space-y-6">
      {(Object.entries(rounds) as [string, Match[]][]).map(([round, roundMatches]) => (
        <Card className="glass-card" key={round}>
          <CardHeader>
            <CardTitle>{t('round', { round })}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {roundMatches.map((match: Match) => {
                const teamAWon = match.setsA > match.setsB;
                const teamBWon = match.setsB > match.setsA;
                const tie = match.setsA === match.setsB;

                return (
                  <div key={match.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">
                        {match.court?.label || t('court', { court: match.courtId || '' })}
                      </Badge>
                      {match.tier && <Badge variant="secondary">{match.tier}</Badge>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div className={`space-y-2 ${teamAWon ? 'font-bold' : ''}`}>
                        <p className="text-sm font-medium">{t('teamA')}</p>
                        {match.teamA?.map((player) => (
                          <div key={player.id} className="flex items-center gap-2 text-sm">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={player.profilePhoto || undefined}
                                alt={player.name || 'Player'}
                              />
                              <AvatarFallback className="gradient-primary text-xs">
                                {player.name
                                  ? player.name
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')
                                      .toUpperCase()
                                      .slice(0, 2)
                                  : '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span>{player.name}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          <span className={teamAWon ? 'text-green-600' : ''}>{match.setsA}</span>
                          <span className="mx-2">-</span>
                          <span className={teamBWon ? 'text-green-600' : ''}>{match.setsB}</span>
                        </div>
                        {tie && <p className="text-xs text-muted-foreground mt-1">{t('tie')}</p>}
                      </div>
                      <div className={`space-y-2 ${teamBWon ? 'font-bold' : ''}`}>
                        <p className="text-sm font-medium">{t('teamB')}</p>
                        {match.teamB?.map((player) => (
                          <div key={player.id} className="flex items-center gap-2 text-sm">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={player.profilePhoto || undefined}
                                alt={player.name || 'Player'}
                              />
                              <AvatarFallback className="gradient-primary text-xs">
                                {player.name
                                  ? player.name
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')
                                      .toUpperCase()
                                      .slice(0, 2)
                                  : '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span>{player.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
