'use client';

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
import { DataStateWrapper } from '@/components/shared';
import { BadgeAlertIcon } from 'lucide-animated';
import { useEventMatches, type Match } from '@/hooks/use-matches';

export function ResultsView({ eventId }: { eventId: string }) {
  const t = useTranslations('resultsView');

  const { data: matches, isLoading, error } = useEventMatches(eventId);

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
              <BadgeAlertIcon className="size-6" />
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
