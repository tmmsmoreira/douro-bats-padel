'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Save, Lock, Loader2 } from 'lucide-animated';
import { useAuthFetch } from '@/hooks';

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
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [matchResults, setMatchResults] = useState<
    Record<string, { setsA: number; setsB: number }>
  >({});

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
      toast.success('Result saved');
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
      toast.success('Results published! Rankings will be updated.');
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
      toast.error('Please enter a valid score');
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
            <p className="text-lg font-medium mb-2">Event Not Published</p>
            <p>Results can only be entered after the event draw has been published.</p>
          </CardContent>
        </Card>
      );
    }

    if (!hasEventPassed) {
      return (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">Event Not Completed</p>
            <p>Results can only be entered after the event has finished.</p>
            <p className="text-sm mt-2">Event ends: {new Date(event.endsAt).toLocaleString()}</p>
          </CardContent>
        </Card>
      );
    }
  }

  if (!draw || !draw.assignments || draw.assignments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No draw found for this event. Please generate a draw first.
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
              <CardTitle>Match Results Entry</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {enteredMatches} of {totalMatches} matches entered
              </p>
            </div>
            <div className="flex gap-2">
              {hasPublishedMatches && (
                <Badge variant="default" className="gap-1">
                  <Lock className="h-3 w-3" />
                  Published
                </Badge>
              )}
              {!hasPublishedMatches && (
                <Button
                  onClick={() => setShowPublishDialog(true)}
                  disabled={!allMatchesEntered || publishMutation.isPending}
                  className="gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Publish Results
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Masters Results */}
      {Object.keys(mastersRounds).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Masters</h2>
          {Object.entries(mastersRounds)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([round, assignments]) => (
              <Card key={`masters-${round}`}>
                <CardHeader>
                  <CardTitle className="text-lg">Round {round}</CardTitle>
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
                                  Saved
                                </Badge>
                              )}
                              {isPublished && (
                                <Badge variant="default" className="gap-1">
                                  <Lock className="h-3 w-3" />
                                  Published
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            {/* Team A */}
                            <div className="space-y-1">
                              <p className="text-sm font-medium">Team A</p>
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
                                  Team A Sets
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
                                  Team B Sets
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
                              <p className="text-sm font-medium">Team B</p>
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
                                {isSaved ? 'Update' : 'Save'}
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
          <h2 className="text-2xl font-bold">Explorers</h2>
          {Object.entries(explorersRounds)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([round, assignments]) => (
              <Card key={`explorers-${round}`}>
                <CardHeader>
                  <CardTitle className="text-lg">Round {round}</CardTitle>
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
                                  Saved
                                </Badge>
                              )}
                              {isPublished && (
                                <Badge variant="default" className="gap-1">
                                  <Lock className="h-3 w-3" />
                                  Published
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            {/* Team A */}
                            <div className="space-y-1">
                              <p className="text-sm font-medium">Team A</p>
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
                                  Team A Sets
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
                                  Team B Sets
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
                              <p className="text-sm font-medium">Team B</p>
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
                                {isSaved ? 'Update' : 'Save'}
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
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Results?</AlertDialogTitle>
            <AlertDialogDescription>
              This will publish all match results and update player rankings. This action cannot be
              undone.
              <br />
              <br />
              <strong>
                Matches entered: {enteredMatches} of {totalMatches}
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending}
            >
              {publishMutation.isPending ? 'Publishing...' : 'Publish Results'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
