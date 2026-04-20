'use client';

import { useEffect, useRef, useState } from 'react';
import { UseMutationResult } from '@tanstack/react-query';
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
import {
  BadgeAlertIcon,
  LockIcon,
  LockIconHandle,
  RefreshCwIcon,
  RefreshCwIconHandle,
} from 'lucide-animated';
import {
  usePublishMatches,
  useRecomputeRankings,
  useSaveMatchResults,
  useEventDetails,
  useDraw,
  useEventMatches,
} from '@/hooks';
import type { MatchResultData, Match } from '@/hooks/use-matches';
import { useTranslations } from 'next-intl';
import { MatchResultEntry } from '../shared/results';
import type { Draw, Assignment as DrawAssignment } from '@padel/types';
import { DataStateWrapper } from '@/components/shared';
import { ResultsSkeleton } from '@/components/shared/results';
import { TierCollapsibleItem } from '@/components/shared/tier-collapsible-item';

interface ResultsViewProps {
  eventId: string;
}

export function ResultsView({ eventId }: ResultsViewProps) {
  const t = useTranslations('resultsEntry');
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showRecomputeDialog, setShowRecomputeDialog] = useState(false);
  const [matchResults, setMatchResults] = useState<
    Record<string, { setsA: number | ''; setsB: number | '' }>
  >({});

  // Fetch event data to check state and date
  const { data: event, isLoading: isLoadingEvent } = useEventDetails(eventId);

  // Fetch draw assignments
  const { data: draw } = useDraw(eventId);

  // Fetch existing matches
  const { data: matches, isLoading } = useEventMatches(eventId);

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
  const recomputeMutation = useRecomputeRankings(eventId, () => {
    setShowRecomputeDialog(false);
  });

  const handleScoreChange = (courtId: string, round: number, team: 'A' | 'B', value: string) => {
    const key = `${courtId}-${round}`;
    const defaultResult = { setsA: '' as number | '', setsB: '' as number | '' };

    if (value === '') {
      setMatchResults((prev) => ({
        ...prev,
        [key]: {
          ...defaultResult,
          ...prev[key],
          [`sets${team}`]: '',
        },
      }));
      return;
    }

    const numValue = parseInt(value);
    if (isNaN(numValue)) return;

    setMatchResults((prev) => ({
      ...prev,
      [key]: {
        ...defaultResult,
        ...prev[key],
        [`sets${team}`]: Math.max(0, Math.min(20, numValue)),
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

        const setsA = result?.setsA === '' ? 0 : (result?.setsA ?? 0);
        const setsB = result?.setsB === '' ? 0 : (result?.setsB ?? 0);

        if (!result || (setsA === 0 && setsB === 0)) {
          return null;
        }

        // Check if the result has changed from the existing match
        const existingMatch = matches?.find(
          (m) => m.courtId === assignment.courtId && m.round === assignment.round
        );

        if (existingMatch) {
          const hasChanges = existingMatch.setsA !== setsA || existingMatch.setsB !== setsB;

          if (!hasChanges) {
            return null; // No changes, skip this match
          }
        }

        return {
          eventId,
          courtId: assignment.courtId,
          round: assignment.round,
          setsA,
          setsB,
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
      loadingComponent={<ResultsSkeleton />}
      emptyMessage={t('eventNotFound')}
    >
      {() =>
        validationMessage ? (
          validationMessage
        ) : draw ? (
          <ResultsViewContent
            draw={draw}
            matches={matches}
            matchResults={matchResults}
            handleScoreChange={handleScoreChange}
            handleSaveAllResults={handleSaveAllResults}
            publishMutation={publishMutation}
            showPublishDialog={showPublishDialog}
            setShowPublishDialog={setShowPublishDialog}
            recomputeMutation={recomputeMutation}
            showRecomputeDialog={showRecomputeDialog}
            setShowRecomputeDialog={setShowRecomputeDialog}
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
  defaultOpen = true,
  t,
}: {
  tier: 'MASTERS' | 'EXPLORERS';
  rounds: Record<number, DrawAssignment[]>;
  matchResults: Record<string, { setsA: number | ''; setsB: number | '' }>;
  matches: Match[] | undefined;
  handleScoreChange: (courtId: string, round: number, team: 'A' | 'B', value: string) => void;
  defaultOpen?: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (Object.keys(rounds).length === 0) return null;

  const roundCount = Object.keys(rounds).length;
  const matchCount = Object.values(rounds).reduce((sum, a) => sum + a.length, 0);

  return (
    <TierCollapsibleItem
      open={isOpen}
      onOpenChange={setIsOpen}
      tierName={tier === 'MASTERS' ? t('masters') : t('explorers')}
      tierColor={tier === 'MASTERS' ? 'bg-yellow-500' : 'bg-green-500'}
      badges={[`${roundCount} ${t('rounds')}`, `${matchCount} ${t('matches')}`]}
    >
      <div className="space-y-8">
        {Object.entries(rounds)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([round, assignments]) => (
            <Card key={`${tier}-${round}`} className="shadow-none border-0">
              <CardHeader className="px-0 pb-4 pt-0">
                <CardTitle className="text-lg">{t('round', { round })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-0">
                <div className="grid grid-cols-1 gap-4">
                  {assignments.map((assignment) => {
                    const key = `${assignment.courtId}-${assignment.round}`;
                    const result = matchResults[key] || { setsA: '', setsB: '' };
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
                        }}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </TierCollapsibleItem>
  );
}

// Separate component for results entry content
function ResultsViewContent({
  draw,
  matches,
  matchResults,
  handleScoreChange,
  handleSaveAllResults,
  publishMutation,
  showPublishDialog,
  setShowPublishDialog,
  recomputeMutation,
  showRecomputeDialog,
  setShowRecomputeDialog,
  t,
}: {
  draw: Draw;
  matches: Match[] | undefined;
  matchResults: Record<string, { setsA: number | ''; setsB: number | '' }>;
  handleScoreChange: (courtId: string, round: number, team: 'A' | 'B', value: string) => void;
  handleSaveAllResults: () => void;
  publishMutation: UseMutationResult<unknown, Error, void, unknown>;
  showPublishDialog: boolean;
  setShowPublishDialog: (show: boolean) => void;
  recomputeMutation: UseMutationResult<unknown, Error, void, unknown>;
  showRecomputeDialog: boolean;
  setShowRecomputeDialog: (show: boolean) => void;
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

  const refreshCwIconRef = useRef<RefreshCwIconHandle>(null);
  const lockIconRef = useRef<LockIconHandle>(null);

  // Check if all matches have been entered
  const totalMatches = draw.assignments.length;
  const enteredMatches = Object.values(matchResults).filter(
    (r) => (r.setsA || 0) > 0 || (r.setsB || 0) > 0
  ).length;
  const allMatchesEntered = enteredMatches === totalMatches;

  // Check if any matches are published
  const hasPublishedMatches = matches?.some((m) => m.publishedAt !== null);

  // Check if there are unsaved changes
  const hasUnsavedChanges = draw.assignments.some((assignment) => {
    const key = `${assignment.courtId}-${assignment.round}`;
    const result = matchResults[key];
    const setsA = result?.setsA === '' ? 0 : (result?.setsA ?? 0);
    const setsB = result?.setsB === '' ? 0 : (result?.setsB ?? 0);

    if (setsA === 0 && setsB === 0) {
      return false;
    }

    const existingMatch = matches?.find(
      (m) => m.courtId === assignment.courtId && m.round === assignment.round
    );

    if (!existingMatch) return true;
    return existingMatch.setsA !== setsA || existingMatch.setsB !== setsB;
  });

  return (
    <div className="space-y-4">
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
            {hasPublishedMatches && (
              <div className="flex flex-1">
                <Badge variant="default" className="gap-1">
                  <Lock className="h-3 w-3" />
                  {t('published')}
                </Badge>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleSaveAllResults}
                disabled={!hasUnsavedChanges}
                variant="outline"
                className="gap-2"
              >
                {t('saveAllResults')}
              </Button>
              {hasPublishedMatches && (
                <Button
                  onClick={() => setShowRecomputeDialog(true)}
                  disabled={recomputeMutation.isPending}
                  className="gap-2"
                  onMouseEnter={() => refreshCwIconRef.current?.startAnimation()}
                  onMouseLeave={() => refreshCwIconRef.current?.stopAnimation()}
                >
                  <RefreshCwIcon ref={refreshCwIconRef} className="h-4 w-4" />
                  {t('recomputeRankings')}
                </Button>
              )}
              {!hasPublishedMatches && (
                <Button
                  onClick={() => setShowPublishDialog(true)}
                  disabled={!allMatchesEntered || publishMutation.isPending}
                  className="gap-2"
                  onMouseEnter={() => lockIconRef.current?.startAnimation()}
                  onMouseLeave={() => lockIconRef.current?.stopAnimation()}
                >
                  <LockIcon ref={lockIconRef} size={16} />
                  {t('publishResults')}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <ResultsTierSection
        tier="MASTERS"
        rounds={mastersRounds}
        matchResults={matchResults}
        matches={matches}
        handleScoreChange={handleScoreChange}
        defaultOpen={false}
        t={t}
      />

      <ResultsTierSection
        tier="EXPLORERS"
        rounds={explorersRounds}
        matchResults={matchResults}
        matches={matches}
        handleScoreChange={handleScoreChange}
        defaultOpen={false}
        t={t}
      />

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

      {/* Recompute confirmation dialog */}
      <ConfirmationDialog
        open={showRecomputeDialog}
        onOpenChange={setShowRecomputeDialog}
        title={t('recomputeRankingsTitle')}
        description={t('recomputeRankingsDescription')}
        confirmText={t('recomputeRankings')}
        cancelText={t('cancel')}
        variant="default"
        isLoading={recomputeMutation.isPending}
        onConfirm={() => recomputeMutation.mutate()}
      />
    </div>
  );
}
