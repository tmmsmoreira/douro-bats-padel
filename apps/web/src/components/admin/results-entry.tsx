'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { Lock, Calendar, ClipboardList } from 'lucide-react';
import { BadgeAlertIcon, LockIcon, LockIconHandle } from 'lucide-animated';
import { useAuthFetch, usePublishMatches, useSaveMatchResults } from '@/hooks';
import type { MatchResultData } from '@/hooks/use-matches';
import { useTranslations } from 'next-intl';
import { MatchResultEntry } from '../shared/draw';
import { DataStateWrapper } from '@/components/shared';
import type { Assignment as DrawAssignment } from '../shared/draw/types';

interface Match {
  id: string;
  eventId: string;
  courtId: string;
  court?: { label: string };
  round: number;
  setsA: number;
  setsB: number;
  tier: string;
  publishedAt: string | null;
  teamA?: Array<{ id: string; name: string }>;
  teamB?: Array<{ id: string; name: string }>;
}

interface Event {
  id: string;
  title: string | null;
  date: string;
  state: 'DRAFT' | 'OPEN' | 'FROZEN' | 'DRAWN' | 'PUBLISHED';
  endsAt: string;
  startsAt: string;
  venue?: {
    id: string;
    name: string;
  };
}

interface Draw {
  id: string;
  eventId: string;
  assignments: DrawAssignment[];
}

interface ResultsEntryProps {
  eventId: string;
}

export function ResultsEntry({ eventId }: ResultsEntryProps) {
  const t = useTranslations('resultsEntry');
  const authFetch = useAuthFetch();
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [matchResults, setMatchResults] = useState<
    Record<string, { setsA: number; setsB: number }>
  >({});
  const lockIconRef = useRef<LockIconHandle>(null);

  // Fetch event data to check state and date
  const { data: event, isLoading: isLoadingEvent } = useQuery<Event>({
    queryKey: ['event', eventId],
    queryFn: () => authFetch.get(`/events/${eventId}`),
  });

  // Fetch draw assignments
  const { data: draw } = useQuery<Draw>({
    queryKey: ['draw', eventId],
    queryFn: () => authFetch.get(`/draws/events/${eventId}`),
  });

  // Fetch existing matches
  const { data: matches, isLoading } = useQuery<Match[]>({
    queryKey: ['matches', eventId],
    queryFn: () => authFetch.get(`/matches/events/${eventId}`),
  });

  // Initialize match results from existing matches
  useEffect(() => {
    if (matches) {
      const results: Record<string, { setsA: number; setsB: number }> = {};
      matches.forEach((match) => {
        const key = `${match.courtId}-${match.round}`;
        results[key] = { setsA: match.setsA, setsB: match.setsB };
      });
      setMatchResults(results);
    }
  }, [matches]);

  // Use custom hooks for saving and publishing matches
  const saveResultsMutation = useSaveMatchResults(eventId);
  const publishMutation = usePublishMatches(eventId, () => {
    setShowPublishDialog(false);
  });

  const handleScoreChange = (courtId: string, round: number, team: 'A' | 'B', value: string) => {
    const key = `${courtId}-${round}`;
    const numValue = parseInt(value) || 0;

    setMatchResults((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [`sets${team}`]: Math.max(0, Math.min(6, numValue)), // Clamp between 0-6
      },
    }));
  };

  const handleSaveAllResults = () => {
    if (!draw) return;

    // Collect all results that have been entered
    const resultsToSave = draw.assignments
      .map((assignment): MatchResultData | null => {
        const key = `${assignment.courtId}-${assignment.round}`;
        const result = matchResults[key];

        if (!result || (result.setsA === 0 && result.setsB === 0)) {
          return null;
        }

        // Check if the result has changed from the existing match
        const existingMatch = matches?.find(
          (m) => m.courtId === assignment.courtId && m.round === assignment.round
        );

        if (existingMatch) {
          const hasChanges =
            existingMatch.setsA !== result.setsA || existingMatch.setsB !== result.setsB;

          if (!hasChanges) {
            return null; // No changes, skip this match
          }
        }

        return {
          eventId,
          courtId: assignment.courtId,
          round: assignment.round,
          setsA: result.setsA,
          setsB: result.setsB,
          tier: assignment.tier,
        };
      })
      .filter((result): result is MatchResultData => result !== null);

    if (resultsToSave.length === 0) {
      toast.info(t('noChangesToSave') || 'No changes to save');
      return;
    }

    saveResultsMutation.mutate(resultsToSave);
  };

  const isLoadingData = isLoading || isLoadingEvent;

  // Custom validation for results entry
  const getValidationMessage = () => {
    if (!event) return null;
    if (event.state !== 'PUBLISHED') {
      return (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BadgeAlertIcon className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{t('eventNotPublished')}</EmptyTitle>
            <EmptyDescription>{t('eventNotPublishedDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      );
    }
    if (new Date(event.endsAt) > new Date()) {
      return (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Calendar className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{t('eventNotCompleted')}</EmptyTitle>
            <EmptyDescription>
              {t('eventNotCompletedDescription')}
              <br />
              <span className="text-xs mt-2 block">
                {t('eventEnds', { date: new Date(event.endsAt).toLocaleString() })}
              </span>
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      );
    }
    if (!draw || !draw.assignments || draw.assignments.length === 0) {
      return (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardList className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{t('noDrawFound')}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      );
    }
    return null;
  };

  const validationMessage = getValidationMessage();

  return (
    <DataStateWrapper
      isLoading={isLoadingData}
      data={event}
      loadingMessage={t('loading')}
      emptyMessage={t('eventNotFound')}
    >
      {() =>
        validationMessage ? (
          validationMessage
        ) : draw ? (
          <ResultsEntryContent
            draw={draw}
            matches={matches}
            matchResults={matchResults}
            handleScoreChange={handleScoreChange}
            handleSaveAllResults={handleSaveAllResults}
            publishMutation={publishMutation}
            showPublishDialog={showPublishDialog}
            setShowPublishDialog={setShowPublishDialog}
            lockIconRef={lockIconRef}
            t={t}
          />
        ) : null
      }
    </DataStateWrapper>
  );
}

// Component for rendering a tier section with result entry
function ResultsTierSection({
  tier,
  rounds,
  matchResults,
  matches,
  handleScoreChange,
  t,
}: {
  tier: 'MASTERS' | 'EXPLORERS';
  rounds: Record<number, DrawAssignment[]>;
  matchResults: Record<string, { setsA: number; setsB: number }>;
  matches: Match[] | undefined;
  handleScoreChange: (courtId: string, round: number, team: 'A' | 'B', value: string) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const tierIndicatorClass =
    tier === 'MASTERS' ? 'w-2 h-6 bg-yellow-500 rounded-full' : 'w-2 h-6 bg-green-500 rounded-full';

  if (Object.keys(rounds).length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className={tierIndicatorClass}></div>
        <h2 className="text-2xl font-bold">{tier === 'MASTERS' ? t('masters') : t('explorers')}</h2>
      </div>

      {Object.entries(rounds)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([round, assignments]) => (
          <Card key={`${tier}-${round}`} className="glass-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">{t('round', { round })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-1 gap-2">
                {assignments.map((assignment) => {
                  const key = `${assignment.courtId}-${assignment.round}`;
                  const result = matchResults[key] || { setsA: 0, setsB: 0 };
                  const existingMatch = matches?.find(
                    (m) => m.courtId === assignment.courtId && m.round === assignment.round
                  );
                  const isPublished = existingMatch ? existingMatch.publishedAt !== null : false;
                  const isSaved = !!existingMatch;

                  return (
                    <MatchResultEntry
                      key={assignment.id}
                      assignment={assignment}
                      courtLabel={(courtId: string) => t('court', { id: courtId })}
                      result={result}
                      onScoreChange={(team: 'A' | 'B', value: string) =>
                        handleScoreChange(assignment.courtId, assignment.round, team, value)
                      }
                      isSaved={isSaved}
                      isPublished={isPublished}
                      showSaveButton={false}
                      translations={{
                        teamA: t('teamA'),
                        teamB: t('teamB'),
                        teamASets: t('teamASets'),
                        teamBSets: t('teamBSets'),
                        saved: t('saved'),
                        published: t('published'),
                      }}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}

// Separate component for results entry content
function ResultsEntryContent({
  draw,
  matches,
  matchResults,
  handleScoreChange,
  handleSaveAllResults,
  publishMutation,
  showPublishDialog,
  setShowPublishDialog,
  lockIconRef,
  t,
}: {
  draw: Draw;
  matches: Match[] | undefined;
  matchResults: Record<string, { setsA: number; setsB: number }>;
  handleScoreChange: (courtId: string, round: number, team: 'A' | 'B', value: string) => void;
  handleSaveAllResults: () => void;
  publishMutation: UseMutationResult<unknown, Error, void, unknown>;
  showPublishDialog: boolean;
  setShowPublishDialog: (show: boolean) => void;
  lockIconRef: React.RefObject<LockIconHandle | null>;
  t: ReturnType<typeof useTranslations>;
}) {
  // Group assignments by tier and round (same as draw page)
  const masterAssignments = draw.assignments.filter((a) => a.tier === 'MASTERS');
  const explorerAssignments = draw.assignments.filter((a) => a.tier === 'EXPLORERS');

  const groupByRound = (assignments: DrawAssignment[]) => {
    return assignments.reduce(
      (acc: Record<number, DrawAssignment[]>, assignment: DrawAssignment) => {
        if (!acc[assignment.round]) {
          acc[assignment.round] = [];
        }
        acc[assignment.round].push(assignment);
        return acc;
      },
      {}
    );
  };

  const mastersRounds = groupByRound(masterAssignments);
  const explorersRounds = groupByRound(explorerAssignments);

  // Check if all matches have been entered
  const totalMatches = draw.assignments.length;
  const enteredMatches = Object.values(matchResults).filter(
    (r) => r.setsA > 0 || r.setsB > 0
  ).length;
  const allMatchesEntered = enteredMatches === totalMatches;

  // Check if any matches are published
  const hasPublishedMatches = matches?.some((m) => m.publishedAt !== null);

  return (
    <div className="space-y-8">
      {/* Header with stats */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{t('matchResultsEntry')}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t('matchesEntered', { entered: enteredMatches, total: totalMatches })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {hasPublishedMatches && (
                <Badge variant="default" className="gap-1">
                  <Lock className="h-3 w-3" />
                  {t('published')}
                </Badge>
              )}
              {!hasPublishedMatches && (
                <>
                  <Button
                    onClick={handleSaveAllResults}
                    variant="outline"
                    className="gap-2"
                    animate
                  >
                    {t('saveAllResults')}
                  </Button>
                  <Button
                    onClick={() => setShowPublishDialog(true)}
                    disabled={!allMatchesEntered || publishMutation.isPending}
                    className="gap-2"
                    onMouseEnter={() => lockIconRef.current?.startAnimation()}
                    onMouseLeave={() => lockIconRef.current?.stopAnimation()}
                    animate
                  >
                    <LockIcon ref={lockIconRef} size={16} />
                    {t('publishResults')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Masters Results - Using TierSection with custom render */}
      {Object.keys(mastersRounds).length > 0 && (
        <ResultsTierSection
          tier="MASTERS"
          rounds={mastersRounds}
          matchResults={matchResults}
          matches={matches}
          handleScoreChange={handleScoreChange}
          t={t}
        />
      )}

      {/* Explorers Results - Using TierSection with custom render */}
      {Object.keys(explorersRounds).length > 0 && (
        <ResultsTierSection
          tier="EXPLORERS"
          rounds={explorersRounds}
          matchResults={matchResults}
          matches={matches}
          handleScoreChange={handleScoreChange}
          t={t}
        />
      )}

      {/* Publish confirmation dialog */}
      <ConfirmationDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        title={t('publishResultsTitle')}
        description={
          <>
            {t('publishResultsDescription')}
            <br />
            <br />
            <strong>
              {t('matchesEnteredCount', { entered: enteredMatches, total: totalMatches })}
            </strong>
          </>
        }
        confirmText={t('publishResults')}
        cancelText={t('cancel')}
        variant="default"
        isLoading={publishMutation.isPending}
        onConfirm={() => publishMutation.mutate()}
      />
    </div>
  );
}
