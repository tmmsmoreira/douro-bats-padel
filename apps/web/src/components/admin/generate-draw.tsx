'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslations, useLocale } from 'next-intl';
import { AlertTriangle, Info, Lightbulb, Clock } from 'lucide-react';
import { useGenerateDraw, useEventDetails, useDraw } from '@/hooks';
import { PlayerListItem } from '@/components/shared/player-list-item';
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
  const router = useRouter();
  const t = useTranslations('generateDraw');
  const locale = useLocale();

  const [constraints, setConstraints] = useState({
    avoidRecentSessions: 4,
    balanceStrength: true,
    allowTierMixing: false,
  });

  // State for selected courts (initialized after event loads)
  const [selectedMastersCourts, setSelectedMastersCourts] = useState<string[]>([]);
  const [selectedExplorersCourts, setSelectedExplorersCourts] = useState<string[]>([]);

  // Fetch event details
  const { data: eventData, isLoading: eventLoading } = useEventDetails(eventId);
  const event = eventData as EventDetails | undefined;

  // Check if draw already exists
  const { data: existingDraw } = useDraw(eventId);

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

  const confirmedCount = event?.confirmedCount || 0;

  const drawMetrics = useMemo(() => {
    const mastersCapacity = selectedMastersCourts.length * 4;
    const explorersCapacity = selectedExplorersCourts.length * 4;
    const maxPlayers = mastersCapacity + explorersCapacity;

    const allAvailableCourts = [...new Set([...mastersCourts, ...explorersCourts])];
    const maxPlayersPerCourt = 4;

    const adjustedPlayerCount = Math.floor(confirmedCount / 4) * 4;

    const hasExcessPlayers = adjustedPlayerCount > maxPlayers;
    const playersInDraw = hasExcessPlayers ? Math.floor(maxPlayers / 4) * 4 : adjustedPlayerCount;
    const waitlistedPlayers = confirmedCount - playersInDraw;

    const courtsNeeded = Math.ceil(playersInDraw / maxPlayersPerCourt);
    const unusedCourts = playersInDraw > 0 ? allAvailableCourts.length - courtsNeeded : 0;

    const hasInsufficientPlayers =
      confirmedCount > 0 && playersInDraw < confirmedCount && !hasExcessPlayers;

    const allCourts = event?.eventCourts?.map((ec: EventCourt) => ec.court) || [];
    const availableCourts = allCourts.filter((court: Court) =>
      allAvailableCourts.includes(court.id)
    );

    const mastersPlayerCount = Math.floor(
      (playersInDraw * (tierRules.masterPercentage || 50)) / 100
    );
    const explorersPlayerCount = playersInDraw - mastersPlayerCount;

    return {
      mastersCapacity,
      explorersCapacity,
      maxPlayers,
      playersInDraw,
      waitlistedPlayers,
      courtsNeeded,
      unusedCourts,
      hasExcessPlayers,
      hasInsufficientPlayers,
      availableCourts,
      mastersPlayerCount,
      explorersPlayerCount,
    };
  }, [
    selectedMastersCourts.length,
    selectedExplorersCourts.length,
    mastersCourts,
    explorersCourts,
    confirmedCount,
    event?.eventCourts,
    tierRules.masterPercentage,
  ]);

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
          <Button variant="outline" onClick={() => router.push(`/events/${eventId}`)}>
            {t('backToEvent')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const {
    mastersCapacity,
    explorersCapacity,
    maxPlayers,
    playersInDraw,
    waitlistedPlayers,
    courtsNeeded,
    unusedCourts,
    hasExcessPlayers,
    hasInsufficientPlayers,
    availableCourts,
    mastersPlayerCount,
    explorersPlayerCount,
  } = drawMetrics;

  return (
    <div className="space-y-6">
      {/* ── Action card ────────────────────────────────────────────────── */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <CardTitle>{t('title')}</CardTitle>
              <p className="text-sm text-muted-foreground">{t('description')}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{t('splitMethod')}:</span>
                {tierRules.masterCount !== undefined ? (
                  <Badge variant="outline" className="text-xs">
                    {t('fixedCount')}: {tierRules.masterCount} {t('masters')}
                  </Badge>
                ) : tierRules.masterPercentage !== undefined ? (
                  <Badge variant="outline" className="text-xs">
                    {tierRules.masterPercentage}% {t('masters')} /{' '}
                    {100 - tierRules.masterPercentage}% {t('explorers')}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    {t('defaultSplit')}
                  </Badge>
                )}
              </div>
            </div>
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
              disabled={
                generateDrawMutation.isPending || playersInDraw < 4 || event.state !== 'FROZEN'
              }
            >
              {generateDrawMutation.isPending
                ? t('generating')
                : existingDraw
                  ? t('generateNewDraw')
                  : t('generateDraw')}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* ── Alerts ─────────────────────────────────────────────────────── */}

      {existingDraw && (
        <Card
          className={
            event.state === 'PUBLISHED'
              ? 'glass-card border-red-500 bg-red-50 dark:bg-red-950/20'
              : 'glass-card border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
          }
        >
          <CardHeader>
            <CardTitle
              className={
                event.state === 'PUBLISHED'
                  ? 'text-red-800 dark:text-red-200 flex items-center gap-2'
                  : 'text-yellow-800 dark:text-yellow-200 flex items-center gap-2'
              }
            >
              <AlertTriangle className="h-5 w-5" />
              {t('drawAlreadyExists')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {event.state === 'PUBLISHED' ? (
              <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <p>{t.rich('drawPublishedWarning', { strong: (c) => <strong>{c}</strong> })}</p>
                <p>
                  {t.rich('drawPublishedInstructions', { strong: (c) => <strong>{c}</strong> })}
                </p>
              </div>
            ) : (
              <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <p>{t('drawExistsWarning')}</p>
                <p>{t.rich('drawExistsInstructions', { strong: (c) => <strong>{c}</strong> })}</p>
              </div>
            )}
          </CardContent>
          <CardContent>
            <Button variant="outline" onClick={() => router.push(`/events/${eventId}/draw`)}>
              {t('viewManageDraw')}
            </Button>
          </CardContent>
        </Card>
      )}

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

      {hasExcessPlayers && (
        <Card className="glass-card border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t('excessPlayersDetected')}
            </CardTitle>
            <div className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
              <p>
                {t('excessPlayersDescription', {
                  confirmedCount,
                  mastersCourts: mastersCourts.length,
                  explorersCourts: explorersCourts.length,
                  maxPlayers,
                })}
              </p>
              <p>
                {t.rich('playersInDrawInfo', {
                  playersInDraw,
                  waitlistedPlayers,
                  strong: (c) => <strong>{c}</strong>,
                })}
              </p>
              <p>{t('allCourtsUsed')}</p>
            </div>
          </CardHeader>
        </Card>
      )}

      {hasInsufficientPlayers && confirmedCount >= 4 && (
        <Card className="glass-card border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
              <Info className="h-5 w-5" />
              {t('insufficientPlayers')}
            </CardTitle>
            <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <p>{t('insufficientPlayersDescription', { confirmedCount, playersInDraw })}</p>
              {waitlistedPlayers > 0 && (
                <p>
                  {t.rich('playersWaitlisted', {
                    count: waitlistedPlayers,
                    strong: (c) => <strong>{c}</strong>,
                  })}
                </p>
              )}
              <p>
                {t('courtCapacityInfo', {
                  maxPlayers,
                  mastersCourts: mastersCourts.length,
                  explorersCourts: explorersCourts.length,
                  courtsNeeded,
                })}
              </p>
              <p className="font-semibold">{t('considerReducingCourts')}</p>
            </div>
          </CardHeader>
        </Card>
      )}

      {!hasExcessPlayers && unusedCourts > 0 && playersInDraw > 0 && (
        <Card className="glass-card border-blue-500">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              {t('courtOptimization')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm space-y-1">
              <p>{t('courtOptimizationDescription', { playersInDraw, courtsNeeded })}</p>
              <p>
                {t('courtAllocationInfo', {
                  mastersCourts: mastersCourts.length,
                  explorersCourts: explorersCourts.length,
                })}
              </p>
              <br />
              <p className="font-semibold">{t('considerReducingCourts')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Tier Setup + Players preview ───────────────────────────────── */}

      <div className="grid gap-4 md:grid-cols-2">
        {/* MASTERS */}
        {mastersCourts.length > 0 && (
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-yellow-500 rounded-full" />
                <CardTitle>
                  {t('masters')} ({mastersPlayerCount})
                </CardTitle>
              </div>
              {tierRules.mastersTimeSlot && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground pl-5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {formatTimeSlot(tierRules.mastersTimeSlot.startsAt, event.date, locale)} –{' '}
                    {formatTimeSlot(tierRules.mastersTimeSlot.endsAt, event.date, locale)}
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Players preview */}
              {mastersPlayerCount > 0 && (
                <div className="space-y-2">
                  {event.confirmedPlayers
                    ?.slice(0, mastersPlayerCount)
                    .map((player: Player, index: number) => (
                      <PlayerListItem
                        key={player.id}
                        id={player.id}
                        name={player.name}
                        rating={player.rating}
                        rank={index + 1}
                        variant="leaderboard"
                      />
                    ))}
                </div>
              )}
              {/* Court selection */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">{t('courtSelection')}</p>
                <div className="space-y-2">
                  {availableCourts
                    .filter((court: Court) => mastersCourts.includes(court.id))
                    .map((court: Court) => (
                      <div key={court.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`masters-${court.id}`}
                          checked={selectedMastersCourts.includes(court.id)}
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
                    ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('mastersCourts')}: {mastersCapacity} {t('playersExpected')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* EXPLORERS */}
        {explorersCourts.length > 0 && (
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-green-500 rounded-full" />
                <CardTitle>
                  {t('explorers')} ({explorersPlayerCount})
                </CardTitle>
              </div>
              {tierRules.explorersTimeSlot && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground pl-5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {formatTimeSlot(tierRules.explorersTimeSlot.startsAt, event.date, locale)} –{' '}
                    {formatTimeSlot(tierRules.explorersTimeSlot.endsAt, event.date, locale)}
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Players preview */}
              {explorersPlayerCount > 0 && (
                <div className="space-y-2">
                  {event.confirmedPlayers
                    ?.slice(mastersPlayerCount, mastersPlayerCount + explorersPlayerCount)
                    .map((player: Player, index: number) => (
                      <PlayerListItem
                        key={player.id}
                        id={player.id}
                        name={player.name}
                        rating={player.rating}
                        rank={mastersPlayerCount + index + 1}
                        variant="leaderboard"
                      />
                    ))}
                </div>
              )}
              {/* Court selection */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">{t('courtSelection')}</p>
                <div className="space-y-2">
                  {availableCourts
                    .filter((court: Court) => explorersCourts.includes(court.id))
                    .map((court: Court) => (
                      <div key={court.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`explorers-${court.id}`}
                          checked={selectedExplorersCourts.includes(court.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedExplorersCourts([...selectedExplorersCourts, court.id]);
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
                    ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('explorersCourts')}: {explorersCapacity} {t('playersExpected')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Waitlisted players */}
      {waitlistedPlayers > 0 && (
        <Card className="glass-card border-orange-500">
          <CardHeader>
            <CardTitle>
              {t('waitlistedPlayersList')} ({waitlistedPlayers})
            </CardTitle>
            <CardDescription>{t('waitlistedPlayersDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {event.confirmedPlayers?.slice(playersInDraw).map((player: Player, index: number) => (
                <PlayerListItem
                  key={player.id}
                  id={player.id}
                  name={player.name}
                  rating={player.rating}
                  rank={playersInDraw + index + 1}
                  variant="leaderboard"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Draw Options ───────────────────────────────────────────────── */}

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{t('drawOptions')}</CardTitle>
          <CardDescription>{t('drawOptionsDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="balance-strength">{t('balanceTeamStrength')}</Label>
              <p className="text-sm text-muted-foreground">{t('balanceTeamStrengthDescription')}</p>
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
