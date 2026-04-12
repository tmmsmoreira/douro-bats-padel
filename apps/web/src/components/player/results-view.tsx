'use client';

import { useState } from 'react';
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
import { TierClassificationTable } from '@/components/shared/draw';
import { TierCollapsibleItem } from '@/components/shared/tier-collapsible-item';

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

function ResultsContent({
  matches,
  t,
}: {
  matches: Match[];
  t: ReturnType<typeof useTranslations>;
}) {
  const [openTier, setOpenTier] = useState<string | null>(null);

  // Group matches by tier
  const tiers = matches.reduce(
    (acc: Record<string, Match[]>, match: Match) => {
      const tier = match.tier || 'OTHER';
      if (!acc[tier]) {
        acc[tier] = [];
      }
      acc[tier].push(match);
      return acc;
    },
    {} as Record<string, Match[]>
  );

  // Sort tiers: MASTERS first, EXPLORERS second, then others
  const tierOrder: Record<string, number> = { MASTERS: 0, EXPLORERS: 1 };
  const sortedTiers = Object.entries(tiers).sort(
    ([a], [b]) => (tierOrder[a] ?? 99) - (tierOrder[b] ?? 99)
  );

  const tierColors: Record<string, string> = {
    MASTERS: 'bg-yellow-500',
    EXPLORERS: 'bg-green-500',
  };

  const tierNames: Record<string, string> = {
    MASTERS: t('masters'),
    EXPLORERS: t('explorers'),
  };

  return (
    <div className="space-y-4">
      {sortedTiers.map(([tier, tierMatches]) => {
        const rounds = tierMatches.reduce(
          (acc: Record<number, Match[]>, match: Match) => {
            if (!acc[match.round]) {
              acc[match.round] = [];
            }
            acc[match.round].push(match);
            return acc;
          },
          {} as Record<number, Match[]>
        );

        const roundCount = Object.keys(rounds).length;
        const matchCount = tierMatches.length;

        // Get unique teams count
        const teamSet = new Set<string>();
        tierMatches.forEach((match) => {
          if (match.teamA?.length) {
            teamSet.add(
              match.teamA
                .map((p) => p.id)
                .sort()
                .join('-')
            );
          }
          if (match.teamB?.length) {
            teamSet.add(
              match.teamB
                .map((p) => p.id)
                .sort()
                .join('-')
            );
          }
        });

        const tierKey = tier.toLowerCase();

        return (
          <TierCollapsibleItem
            key={tier}
            open={openTier === tierKey}
            onOpenChange={(open) => setOpenTier(open ? tierKey : null)}
            tierName={tierNames[tier] || tier}
            tierColor={tierColors[tier] || 'bg-gray-500'}
            badges={[
              `${teamSet.size} ${t('teams')}`,
              `${roundCount} ${t('rounds')}`,
              `${matchCount} ${t('matches')}`,
            ]}
          >
            <div className="space-y-4">
              {/* Classification Table */}
              <TierClassificationTable
                matches={tierMatches}
                translations={{
                  classification: t('classification'),
                  team: t('team'),
                  roundAbbr: (round: number) => t('roundAbbr', { round }),
                  total: t('total'),
                  gamesWon: t('gamesWon'),
                  gamesLost: t('gamesLost'),
                  diff: t('diff'),
                  rank: t('rank'),
                }}
              />

              {/* Rounds */}
              {(Object.entries(rounds) as [string, Match[]][])
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([round, roundMatches]) => (
                  <Card className="shadow-none" key={`${tier}-${round}`}>
                    <CardHeader>
                      <CardTitle className="text-lg">{t('round', { round })}</CardTitle>
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
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                <div className={`space-y-2 ${teamAWon ? 'font-bold' : ''}`}>
                                  <p className="text-sm font-medium">{t('teamA')}</p>
                                  {match.teamA?.map((player) => (
                                    <div
                                      key={player.id}
                                      className="flex items-center gap-2 text-sm"
                                    >
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
                                    <span className={teamAWon ? 'text-green-600' : ''}>
                                      {match.setsA}
                                    </span>
                                    <span className="mx-2">-</span>
                                    <span className={teamBWon ? 'text-green-600' : ''}>
                                      {match.setsB}
                                    </span>
                                  </div>
                                  {tie && (
                                    <p className="text-xs text-muted-foreground mt-1">{t('tie')}</p>
                                  )}
                                </div>
                                <div className={`space-y-2 ${teamBWon ? 'font-bold' : ''}`}>
                                  <p className="text-sm font-medium">{t('teamB')}</p>
                                  {match.teamB?.map((player) => (
                                    <div
                                      key={player.id}
                                      className="flex items-center gap-2 text-sm"
                                    >
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
          </TierCollapsibleItem>
        );
      })}
    </div>
  );
}
