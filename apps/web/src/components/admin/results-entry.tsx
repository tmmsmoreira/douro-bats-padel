'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Lock, Loader2, Save } from 'lucide-react';
import { LockIcon, LockIconHandle } from 'lucide-animated';
import { useAuthFetch } from '@/hooks';
import { useTranslations } from 'next-intl';

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

interface Player {
  id: string;
  name: string;
  rating: number;
  tier: string;
}

interface Assignment {
  id: string;
  courtId: string;
  court?: { label: string };
  round: number;
  teamA: Player[];
  teamB: Player[];
  tier: string;
}

interface Event {
  id: string;
  state: string;
  endsAt: string;
  startsAt: string;
}

interface Draw {
  id: string;
  eventId: string;
  assignments: Assignment[];
}

interface ResultsEntryProps {
  eventId: string;
}

export function ResultsEntry({ eventId }: ResultsEntryProps) {
  const t = useTranslations('resultsEntry');
  const queryClient = useQueryClient();
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

  // Save match mutation
  const saveMatchMutation = useMutation({
    mutationFn: async (data: {
      eventId: string;
      courtId: string;
      round: number;
      setsA: number;
      setsB: number;
      tier: string;
    }) => {
      return authFetch.post('/matches', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches', eventId] });
      toast.success(t('resultSaved'));
    },
    onError: (error: Error) => {
      toast.error(`Failed to save result: ${error.message}`);
    },
  });

  // Publish matches mutation
  const publishMutation = useMutation({
    mutationFn: async () => {
      return authFetch.post(`/matches/events/${eventId}/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches', eventId] });
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast.success(t('resultsPublished'));
      setShowPublishDialog(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to publish results: ${error.message}`);
    },
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

  const handleSaveMatch = (assignment: Assignment) => {
    const key = `${assignment.courtId}-${assignment.round}`;
    const result = matchResults[key];

    if (!result || (result.setsA === 0 && result.setsB === 0)) {
      toast.error(t('enterValidScore'));
      return;
    }

    saveMatchMutation.mutate({
      eventId,
      courtId: assignment.courtId,
      round: assignment.round,
      setsA: result.setsA,
      setsB: result.setsB,
      tier: assignment.tier,
    });
  };

  if (isLoading || isLoadingEvent) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t('loading')}</span>
      </div>
    );
  }

  // Check if event is published and has passed
  if (event) {
    const eventEndTime = new Date(event.endsAt);
    const hasEventPassed = eventEndTime < new Date();

    if (event.state !== 'PUBLISHED') {
      return (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">{t('eventNotPublished')}</p>
            <p>{t('eventNotPublishedDescription')}</p>
          </CardContent>
        </Card>
      );
    }

    if (!hasEventPassed) {
      return (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">{t('eventNotCompleted')}</p>
            <p>{t('eventNotCompletedDescription')}</p>
            <p className="text-sm mt-2">
              {t('eventEnds', { date: new Date(event.endsAt).toLocaleString() })}
            </p>
          </CardContent>
        </Card>
      );
    }
  }

  if (!draw || !draw.assignments || draw.assignments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t('noDrawFound')}
        </CardContent>
      </Card>
    );
  }

  // Group assignments by tier and round (same as draw page)
  const masterAssignments = draw.assignments.filter((a) => a.tier === 'MASTERS');
  const explorerAssignments = draw.assignments.filter((a) => a.tier === 'EXPLORERS');

  const groupByRound = (assignments: Assignment[]) => {
    return assignments.reduce((acc: Record<number, Assignment[]>, assignment: Assignment) => {
      if (!acc[assignment.round]) {
        acc[assignment.round] = [];
      }
      acc[assignment.round].push(assignment);
      return acc;
    }, {});
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
    <div className="space-y-6">
      {/* Header with stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('matchResultsEntry')}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t('matchesEntered', { entered: enteredMatches, total: totalMatches })}
              </p>
            </div>
            <div className="flex gap-2">
              {hasPublishedMatches && (
                <Badge variant="default" className="gap-1">
                  <Lock className="h-3 w-3" />
                  {t('published')}
                </Badge>
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

      {/* Masters Results */}
      {Object.keys(mastersRounds).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t('masters')}</h2>
          {Object.entries(mastersRounds)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([round, assignments]) => (
              <Card key={`masters-${round}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{t('round', { round })}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {assignments.map((assignment) => {
                      const key = `${assignment.courtId}-${assignment.round}`;
                      const result = matchResults[key] || { setsA: 0, setsB: 0 };
                      const existingMatch = matches?.find(
                        (m) => m.courtId === assignment.courtId && m.round === assignment.round
                      );
                      const isPublished = existingMatch
                        ? existingMatch.publishedAt !== null
                        : false;
                      const isSaved = !!existingMatch;

                      return (
                        <div
                          key={assignment.id}
                          className={`border rounded-lg p-4 ${isPublished ? 'bg-muted/50' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {assignment.court?.label || `Court ${assignment.courtId}`}
                              </Badge>
                              <Badge variant="secondary">{assignment.tier}</Badge>
                              {isSaved && !isPublished && (
                                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950">
                                  {t('saved')}
                                </Badge>
                              )}
                              {isPublished && (
                                <Badge variant="default" className="gap-1">
                                  <Lock className="h-3 w-3" />
                                  {t('published')}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            {/* Team A */}
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{t('teamA')}</p>
                              {assignment.teamA?.map((player, idx) => (
                                <p key={idx} className="text-sm text-muted-foreground">
                                  {player.name}
                                </p>
                              ))}
                            </div>

                            {/* Score Input */}
                            <div className="flex items-center justify-center gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`${key}-setsA`} className="sr-only">
                                  {t('teamASets')}
                                </Label>
                                <Input
                                  id={`${key}-setsA`}
                                  type="number"
                                  min="0"
                                  max="6"
                                  value={result.setsA}
                                  onChange={(e) =>
                                    handleScoreChange(
                                      assignment.courtId,
                                      assignment.round,
                                      'A',
                                      e.target.value
                                    )
                                  }
                                  disabled={isPublished}
                                  className="w-20 text-center text-lg font-bold"
                                />
                              </div>
                              <span className="text-2xl font-bold">-</span>
                              <div className="space-y-2">
                                <Label htmlFor={`${key}-setsB`} className="sr-only">
                                  {t('teamBSets')}
                                </Label>
                                <Input
                                  id={`${key}-setsB`}
                                  type="number"
                                  min="0"
                                  max="6"
                                  value={result.setsB}
                                  onChange={(e) =>
                                    handleScoreChange(
                                      assignment.courtId,
                                      assignment.round,
                                      'B',
                                      e.target.value
                                    )
                                  }
                                  disabled={isPublished}
                                  className="w-20 text-center text-lg font-bold"
                                />
                              </div>
                            </div>

                            {/* Team B */}
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{t('teamB')}</p>
                              {assignment.teamB?.map((player, idx) => (
                                <p key={idx} className="text-sm text-muted-foreground">
                                  {player.name}
                                </p>
                              ))}
                            </div>
                          </div>

                          {/* Save button */}
                          {!isPublished && (
                            <div className="mt-4 flex justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSaveMatch(assignment)}
                                disabled={saveMatchMutation.isPending}
                                className="gap-2"
                              >
                                <Save className="h-4 w-4" />
                                {isSaved ? t('update') : t('save')}
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Explorers Results */}
      {Object.keys(explorersRounds).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t('explorers')}</h2>
          {Object.entries(explorersRounds)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([round, assignments]) => (
              <Card key={`explorers-${round}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{t('round', { round })}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {assignments.map((assignment) => {
                      const key = `${assignment.courtId}-${assignment.round}`;
                      const result = matchResults[key] || { setsA: 0, setsB: 0 };
                      const existingMatch = matches?.find(
                        (m) => m.courtId === assignment.courtId && m.round === assignment.round
                      );
                      const isPublished = existingMatch
                        ? existingMatch.publishedAt !== null
                        : false;
                      const isSaved = !!existingMatch;

                      return (
                        <div
                          key={assignment.id}
                          className={`border rounded-lg p-4 ${isPublished ? 'bg-muted/50' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {assignment.court?.label || `Court ${assignment.courtId}`}
                              </Badge>
                              <Badge variant="secondary">{assignment.tier}</Badge>
                              {isSaved && !isPublished && (
                                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950">
                                  {t('saved')}
                                </Badge>
                              )}
                              {isPublished && (
                                <Badge variant="default" className="gap-1">
                                  <Lock className="h-3 w-3" />
                                  {t('published')}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            {/* Team A */}
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{t('teamA')}</p>
                              {assignment.teamA?.map((player, idx) => (
                                <p key={idx} className="text-sm text-muted-foreground">
                                  {player.name}
                                </p>
                              ))}
                            </div>

                            {/* Score Input */}
                            <div className="flex items-center justify-center gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`${key}-setsA`} className="sr-only">
                                  {t('teamASets')}
                                </Label>
                                <Input
                                  id={`${key}-setsA`}
                                  type="number"
                                  min="0"
                                  max="6"
                                  value={result.setsA}
                                  onChange={(e) =>
                                    handleScoreChange(
                                      assignment.courtId,
                                      assignment.round,
                                      'A',
                                      e.target.value
                                    )
                                  }
                                  disabled={isPublished}
                                  className="w-20 text-center text-lg font-bold"
                                />
                              </div>
                              <span className="text-2xl font-bold">-</span>
                              <div className="space-y-2">
                                <Label htmlFor={`${key}-setsB`} className="sr-only">
                                  {t('teamBSets')}
                                </Label>
                                <Input
                                  id={`${key}-setsB`}
                                  type="number"
                                  min="0"
                                  max="6"
                                  value={result.setsB}
                                  onChange={(e) =>
                                    handleScoreChange(
                                      assignment.courtId,
                                      assignment.round,
                                      'B',
                                      e.target.value
                                    )
                                  }
                                  disabled={isPublished}
                                  className="w-20 text-center text-lg font-bold"
                                />
                              </div>
                            </div>

                            {/* Team B */}
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{t('teamB')}</p>
                              {assignment.teamB?.map((player, idx) => (
                                <p key={idx} className="text-sm text-muted-foreground">
                                  {player.name}
                                </p>
                              ))}
                            </div>
                          </div>

                          {/* Save button */}
                          {!isPublished && (
                            <div className="mt-4 flex justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSaveMatch(assignment)}
                                disabled={saveMatchMutation.isPending}
                                className="gap-2"
                              >
                                <Save className="h-4 w-4" />
                                {isSaved ? t('update') : t('save')}
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
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
