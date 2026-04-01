'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslations, useLocale } from 'next-intl';
import { AlertTriangle } from 'lucide-react';
import { useAuthFetch, useGenerateDraw } from '@/hooks';
import { StatusBadge } from '../shared';
import { formatTimeSlot } from '@/lib/utils';

interface Court {
  id: string;
  label: string;
}

interface EventCourt {
  court: Court;
}

interface Player {
  id: string;
  name: string;
  rating: number;
  tier?: string;
}

interface TierTimeSlot {
  startsAt: string;
  endsAt: string;
  courtIds: string[];
}

interface TierRules {
  masterCount?: number;
  masterPercentage?: number;
  mastersTimeSlot?: TierTimeSlot;
  explorersTimeSlot?: TierTimeSlot;
}

interface EventDetails {
  id: string;
  title: string | null;
  date: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  state: 'DRAFT' | 'OPEN' | 'FROZEN' | 'DRAWN' | 'PUBLISHED';
  tierRules?: TierRules;
  confirmedCount: number;
  waitlistCount: number;
  confirmedPlayers?: Player[];
  eventCourts?: EventCourt[];
}

interface GenerateDrawProps {
  eventId: string;
}

export function GenerateDraw({ eventId }: GenerateDrawProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations('generateDraw');
  const locale = useLocale();
  const authFetch = useAuthFetch();

  const [constraints, setConstraints] = useState({
    avoidRecentSessions: 4,
    balanceStrength: true,
    allowTierMixing: false,
  });

  // State for selected courts (initialized after event loads)
  const [selectedMastersCourts, setSelectedMastersCourts] = useState<string[]>([]);
  const [selectedExplorersCourts, setSelectedExplorersCourts] = useState<string[]>([]);

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useQuery<EventDetails>({
    queryKey: ['event', eventId, session?.accessToken],
    queryFn: async () => {
      try {
        return await authFetch.get(`/events/${eventId}`);
      } catch (error) {
        throw new Error(`API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    enabled: !!session?.accessToken,
  });

  // Check if draw already exists
  const { data: existingDraw } = useQuery<{ id: string } | null>({
    queryKey: ['draw', eventId, session?.accessToken],
    queryFn: async () => {
      try {
        return await authFetch.get(`/draws/events/${eventId}`);
      } catch {
        return null;
      }
    },
    enabled: !!session?.accessToken,
  });

  // Get available courts from tierRules (must be before useEffect)
  const tierRules = event?.tierRules || {};
  const mastersCourts = useMemo(
    () => tierRules.mastersTimeSlot?.courtIds || [],
    [tierRules.mastersTimeSlot?.courtIds]
  );
  const explorersCourts = useMemo(
    () => tierRules.explorersTimeSlot?.courtIds || [],
    [tierRules.explorersTimeSlot?.courtIds]
  );

  // Initialize selected courts when event loads (must be before early returns)
  useEffect(() => {
    if (mastersCourts.length > 0 && selectedMastersCourts.length === 0) {
      setSelectedMastersCourts(mastersCourts);
    }
    if (explorersCourts.length > 0 && selectedExplorersCourts.length === 0) {
      setSelectedExplorersCourts(explorersCourts);
    }
  }, [
    mastersCourts,
    explorersCourts,
    selectedMastersCourts.length,
    selectedExplorersCourts.length,
  ]);

  const generateDrawMutation = useGenerateDraw(eventId);

  // Check if event has passed
  const eventEndTime = event?.endsAt ? new Date(event.endsAt) : null;
  const hasEventPassed = eventEndTime ? eventEndTime < new Date() : false;

  if (eventLoading) {
    return <div className="text-center py-8">{t('loading')}</div>;
  }

  if (!event) {
    return <div className="text-center py-8">{t('eventNotFound')}</div>;
  }

  // If event has passed and no draw exists, show a message instead of allowing draw generation
  if (hasEventPassed && !existingDraw) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{t('eventCompleted')}</CardTitle>
          <CardDescription>{t('eventCompletedDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => router.push(`/admin/events/${eventId}`)}>
            {t('backToEvent')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const confirmedCount = event.confirmedCount || 0;

  // Since MASTERS and EXPLORERS play at different times, capacity is additive
  // Even if the same courts are used, they can accommodate different players at different times
  // Use SELECTED courts for capacity calculation
  const mastersCapacity = selectedMastersCourts.length * 4;
  const explorersCapacity = selectedExplorersCourts.length * 4;
  const maxPlayers = mastersCapacity + explorersCapacity;

  // Get unique courts for display purposes
  const allAvailableCourts = [...new Set([...mastersCourts, ...explorersCourts])];
  const maxPlayersPerCourt = 4;

  // Adjust player count to nearest multiple of 4 (round down)
  const adjustedPlayerCount = Math.floor(confirmedCount / 4) * 4;

  // Determine actual players in draw (limited by court capacity)
  const hasExcessPlayers = adjustedPlayerCount > maxPlayers;
  const playersInDraw = hasExcessPlayers ? Math.floor(maxPlayers / 4) * 4 : adjustedPlayerCount;
  const waitlistedPlayers = confirmedCount - playersInDraw;

  // Check if we'll have unused courts
  const courtsNeeded = Math.ceil(playersInDraw / maxPlayersPerCourt);
  const unusedCourts = playersInDraw > 0 ? allAvailableCourts.length - courtsNeeded : 0;

  // Check if we have insufficient players
  const hasInsufficientPlayers =
    confirmedCount > 0 && playersInDraw < confirmedCount && !hasExcessPlayers;

  // Get all courts with details
  const allCourts = event.eventCourts?.map((ec: EventCourt) => ec.court) || [];
  const availableCourts = allCourts.filter((court: Court) => allAvailableCourts.includes(court.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      {existingDraw && (
        <Card
          className={
            event.state === 'PUBLISHED'
              ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
              : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
          }
        >
          <CardHeader>
            <CardTitle
              className={
                event.state === 'PUBLISHED'
                  ? 'text-red-800 dark:text-red-200 flex items-center gap-2'
                  : 'text-yellow-800 dark:text-yellow-200'
              }
            >
              {event.state === 'PUBLISHED' && <AlertTriangle className="h-5 w-5" />}
              {t('drawAlreadyExists')}
            </CardTitle>
            <div
              className={
                event.state === 'PUBLISHED'
                  ? 'text-sm text-red-700 dark:text-red-300'
                  : 'text-sm text-yellow-700 dark:text-yellow-300'
              }
            >
              {event.state === 'PUBLISHED' ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: `${t('drawPublishedWarning')}<br />${t('drawPublishedInstructions')}`,
                  }}
                />
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: `${t('drawExistsWarning')}<br />${t('drawExistsInstructions')}`,
                  }}
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.push(`/admin/events/${eventId}/draw`)}>
              {t('viewManageDraw')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Minimum Players Warning (less than 4 players) */}
      {confirmedCount < 4 && (
        <Card className="glass-card border-red-500 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t('minimumPlayersRequired')}
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              {t('minimumPlayersDescription', { confirmedCount })}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Insufficient Players Warning (not enough to fill all courts) */}
      {hasInsufficientPlayers && confirmedCount >= 4 && (
        <Card className="glass-card border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="text-yellow-800 dark:text-yellow-200">
              ℹ️ {t('insufficientPlayers')}
            </CardTitle>
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              <div
                dangerouslySetInnerHTML={{
                  __html: t('insufficientPlayersDescription', {
                    confirmedCount,
                    playersInDraw,
                  }),
                }}
              />
              <br />
              {waitlistedPlayers > 0 && (
                <>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: t('playersWaitlisted', {
                        count: waitlistedPlayers,
                      }),
                    }}
                  />
                  <br />
                </>
              )}
              <div
                dangerouslySetInnerHTML={{
                  __html: t('courtCapacityInfo', {
                    maxPlayers,
                    mastersCourts: mastersCourts.length,
                    explorersCourts: explorersCourts.length,
                    courtsNeeded,
                  }),
                }}
              />
              <br />
              <strong>{t('considerReducingCourts')}</strong>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Excess Players Warning (more players than court capacity) */}
      {hasExcessPlayers && (
        <Card className="glass-card border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t('excessPlayersDetected')}
            </CardTitle>
            <div className="text-sm text-orange-700 dark:text-orange-300">
              <div
                dangerouslySetInnerHTML={{
                  __html: t('excessPlayersDescription', {
                    confirmedCount,
                    mastersCourts: mastersCourts.length,
                    explorersCourts: explorersCourts.length,
                    maxPlayers,
                  }),
                }}
              />
              <br />
              <div
                dangerouslySetInnerHTML={{
                  __html: t('playersInDrawInfo', {
                    playersInDraw,
                    waitlistedPlayers,
                  }),
                }}
              />
              <br />
              {t('allCourtsUsed')}
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Unused Courts Warning (have players but not using all courts) */}
      {!hasExcessPlayers && unusedCourts > 0 && playersInDraw > 0 && (
        <Card className="glass-card border-blue-500 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">
              💡 {t('courtOptimization')}
            </CardTitle>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <div
                dangerouslySetInnerHTML={{
                  __html: t('courtOptimizationDescription', {
                    playersInDraw,
                    courtsNeeded,
                  }),
                }}
              />
              <br />
              <div
                dangerouslySetInnerHTML={{
                  __html: t('courtAllocationInfo', {
                    mastersCourts: mastersCourts.length,
                    explorersCourts: explorersCourts.length,
                  }),
                }}
              />
              <br />
              <strong>{t('considerReducingCourts')}</strong>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Tier Configuration Card */}
      <Card className="glass-card border-blue-500 bg-blue-50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200">
            {t('tierConfiguration')}
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            {t('tierConfigurationDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tier Split Method */}
          <div>
            <span className="font-medium">{t('splitMethod')}:</span>{' '}
            {tierRules.masterCount !== undefined ? (
              <Badge variant="outline">
                {t('fixedCount')}: {tierRules.masterCount} {t('masters')}
              </Badge>
            ) : tierRules.masterPercentage !== undefined ? (
              <Badge variant="outline">
                {tierRules.masterPercentage}% {t('masters')} / {100 - tierRules.masterPercentage}%{' '}
                {t('explorers')}
              </Badge>
            ) : (
              <Badge variant="outline">{t('defaultSplit')}</Badge>
            )}
          </div>

          {/* Expected Distribution */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-white dark:bg-gray-900 rounded-lg border">
            <div>
              <div className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                {t('masters')}
              </div>
              <div className="text-2xl font-bold">
                {Math.floor((playersInDraw * (tierRules.masterPercentage || 50)) / 100)}
              </div>
              <div className="text-xs text-muted-foreground">{t('playersExpected')}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-green-700 dark:text-green-400">
                {t('explorers')}
              </div>
              <div className="text-2xl font-bold">
                {playersInDraw -
                  Math.floor((playersInDraw * (tierRules.masterPercentage || 50)) / 100)}
              </div>
              <div className="text-xs text-muted-foreground">{t('playersExpected')}</div>
            </div>
          </div>

          {/* Time Slots */}
          <div className="grid grid-cols-2 gap-4">
            {tierRules.mastersTimeSlot && (
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  {t('masters')} Time Slot
                </div>
                <div className="text-sm">
                  {formatTimeSlot(tierRules.mastersTimeSlot.startsAt, event.date, locale)} -{' '}
                  {formatTimeSlot(tierRules.mastersTimeSlot.endsAt, event.date, locale)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {mastersCourts.length} {t('courtPlural', { count: mastersCourts.length })} (
                  {t('mastersCourts')}: {mastersCapacity} {t('playersExpected')})
                </div>
              </div>
            )}
            {tierRules.explorersTimeSlot && (
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                  {t('explorers')} Time Slot
                </div>
                <div className="text-sm">
                  {formatTimeSlot(tierRules.explorersTimeSlot.startsAt, event.date, locale)} -{' '}
                  {formatTimeSlot(tierRules.explorersTimeSlot.endsAt, event.date, locale)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {explorersCourts.length} {t('courtPlural', { count: explorersCourts.length })} (
                  {t('explorersCourts')}: {explorersCapacity} {t('playersExpected')})
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>{t('eventSummary')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <div className="flex items-center">
              <span className="font-medium">{t('title_field')}:</span>{' '}
              <span className="ml-2">{event.title || t('untitledEvent')}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">{t('confirmedPlayers')}:</span>
              <span className="ml-2">{confirmedCount}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-2">{t('playersInDraw')}:</span>
              <span className={hasExcessPlayers ? 'text-destructive' : ''}>{playersInDraw}</span>
            </div>
            {waitlistedPlayers > 0 && (
              <div>
                <span className="font-medium">{t('waitlistedPlayers')}:</span>{' '}
                <Badge variant="secondary">{waitlistedPlayers}</Badge>
              </div>
            )}
            <div className="flex items-center">
              <span className="font-medium mr-2">{t('status')}:</span>{' '}
              <StatusBadge status={event.state} />
            </div>
          </CardContent>
          <CardFooter className="pt-0 text-sm text-destructive flex items-center gap-1">
            {event.state !== 'FROZEN' && event.state !== 'DRAWN' && event.state !== 'PUBLISHED' && (
              <>
                <AlertTriangle className="h-4 w-4" />
                {t('eventNotFrozen')}
              </>
            )}
            {playersInDraw < 4 && confirmedCount >= 4 && (
              <>
                <AlertTriangle className="h-4 w-4" />
                {t('excessPlayersWarning')}
              </>
            )}
            {confirmedCount < 4 && (
              <>
                <AlertTriangle className="h-4 w-4" />
                {t('insufficientPlayersWarning')}
              </>
            )}
          </CardFooter>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>{t('courtSelection')}</CardTitle>
            <CardDescription>
              {t('courtSelectionDescription', {
                selectedMasters: selectedMastersCourts.length,
                selectedExplorers: selectedExplorersCourts.length,
                maxPlayers,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {mastersCourts.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2 text-yellow-800 dark:text-yellow-200">
                    {t('masters')} {t('courtPlural', { count: 2 })}:
                  </div>
                  <div className="space-y-2">
                    {availableCourts
                      .filter((court: Court) => mastersCourts.includes(court.id))
                      .map((court: Court) => {
                        const isSelected = selectedMastersCourts.includes(court.id);
                        return (
                          <div key={court.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`masters-${court.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedMastersCourts([...selectedMastersCourts, court.id]);
                                } else {
                                  setSelectedMastersCourts(
                                    selectedMastersCourts.filter((id) => id !== court.id)
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor={`masters-${court.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {court.label}
                            </label>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
              {explorersCourts.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2 text-green-800 dark:text-green-200">
                    {t('explorers')} {t('courtPlural', { count: 2 })}:
                  </div>
                  <div className="space-y-2">
                    {availableCourts
                      .filter((court: Court) => explorersCourts.includes(court.id))
                      .map((court: Court) => {
                        const isSelected = selectedExplorersCourts.includes(court.id);
                        return (
                          <div key={court.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`explorers-${court.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedExplorersCourts([
                                    ...selectedExplorersCourts,
                                    court.id,
                                  ]);
                                } else {
                                  setSelectedExplorersCourts(
                                    selectedExplorersCourts.filter((id) => id !== court.id)
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor={`explorers-${court.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {court.label}
                            </label>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>{t('drawOptions')}</CardTitle>
            <CardDescription>{t('drawOptionsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="balance-strength">{t('balanceTeamStrength')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('balanceTeamStrengthDescription')}
                </p>
              </div>
              <Switch
                id="balance-strength"
                checked={constraints.balanceStrength}
                onCheckedChange={(checked) =>
                  setConstraints({ ...constraints, balanceStrength: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="tier-mixing">{t('allowTierMixing')}</Label>
                <p className="text-sm text-muted-foreground">{t('allowTierMixingDescription')}</p>
              </div>
              <Switch
                id="tier-mixing"
                checked={constraints.allowTierMixing}
                onCheckedChange={(checked) =>
                  setConstraints({ ...constraints, allowTierMixing: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Players in Draw */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>
            {t('confirmedPlayersList')} ({playersInDraw})
          </CardTitle>
          <CardDescription>
            {hasExcessPlayers
              ? t('topRatedPlayersIncluded', { count: playersInDraw })
              : t('allPlayersIncluded')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {event.confirmedPlayers
              ?.slice(0, playersInDraw)
              .map((player: Player, index: number) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">#{index + 1}</span>
                    <span className="text-sm">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {player.tier}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{player.rating}</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Waitlisted Players */}
      {waitlistedPlayers > 0 && (
        <Card className="glass-card border-orange-500">
          <CardHeader>
            <CardTitle>
              {t('waitlistedPlayersList')} ({waitlistedPlayers})
            </CardTitle>
            <CardDescription>{t('waitlistedPlayersDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {event.confirmedPlayers?.slice(playersInDraw).map((player: Player, index: number) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2 border rounded bg-orange-50 dark:bg-orange-950/20"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      #{playersInDraw + index + 1}
                    </span>
                    <span className="text-sm">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {player.tier}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{player.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          {t('cancel')}
        </Button>
        <Button
          onClick={() =>
            generateDrawMutation.mutate({
              constraints,
              selectedCourts: {
                masters: selectedMastersCourts,
                explorers: selectedExplorersCourts,
              },
            })
          }
          disabled={generateDrawMutation.isPending || playersInDraw < 4 || event.state !== 'FROZEN'}
        >
          {generateDrawMutation.isPending
            ? t('generating')
            : existingDraw
              ? t('generateNewDraw')
              : t('generateDraw')}
        </Button>
      </div>

      {generateDrawMutation.isError && (
        <Card className="glass-card border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              {t('drawGenerationError')}:{' '}
              {generateDrawMutation.error instanceof Error
                ? generateDrawMutation.error.message
                : t('drawGenerationError')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
