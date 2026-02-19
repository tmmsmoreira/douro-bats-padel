'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Player {
  id: string;
  name: string;
  rating: number;
  tier?: string;
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
  assignments: Assignment[];
  event?: {
    tierRules?: {
      mastersTimeSlot?: {
        startsAt: string;
        endsAt: string;
      };
      explorersTimeSlot?: {
        startsAt: string;
        endsAt: string;
      };
    };
  };
}

export function EventDetails({ eventId }: { eventId: string }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations('eventDetails');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId, session?.accessToken],
    queryFn: async () => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }

      // Add includeUnpublished=true query parameter for admin view
      const res = await fetch(`${API_URL}/events/${eventId}?includeUnpublished=true`, { headers });

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
      }

      return res.json();
    },
  });

  // Fetch draw if event has one
  const { data: draw } = useQuery({
    queryKey: ['draw', eventId],
    queryFn: async () => {
      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (session?.accessToken) {
          headers.Authorization = `Bearer ${session.accessToken}`;
        }
        const res = await fetch(`${API_URL}/draws/events/${eventId}`, { headers });
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    },
    enabled: event?.state === 'DRAWN' || event?.state === 'PUBLISHED',
  });

  const freezeMutation = useMutation({
    mutationFn: async () => {
      if (!session?.accessToken) {
        throw new Error('Not authenticated');
      }

      const res = await fetch(`${API_URL}/events/${eventId}/freeze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!session?.accessToken) {
        throw new Error('Not authenticated');
      }

      const res = await fetch(`${API_URL}/events/${eventId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!session?.accessToken) {
        throw new Error('Not authenticated');
      }

      const res = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || 'Failed to delete event');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast.success(t('deleteSuccess') || 'Event deleted successfully');
      router.push('/admin');
    },
    onError: (error: Error) => {
      toast.error(t('deleteError') + ': ' + error.message);
      setIsDeleting(false);
    },
  });

  const handleDeleteEvent = () => {
    setShowDeleteDialog(true);
  };

  if (isLoading) {
    return <div className="text-center py-8">{t('loadingEvent')}</div>;
  }

  if (!event) {
    return <div className="text-center py-8">{t('eventNotFound')}</div>;
  }

  // Check if event has passed
  const eventEndTime = new Date(event.endsAt);
  const hasEventPassed = eventEndTime < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{event.title || t('untitledEvent')}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            {event.venue && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{event.venue.name}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {!hasEventPassed && (
            <Link href={`/admin/events/${eventId}/edit`}>
              <Button variant="outline">{t('editEvent')}</Button>
            </Link>
          )}
          {event.state === 'DRAFT' && !hasEventPassed && (
            <Button onClick={() => publishMutation.mutate()}>{t('publishEvent')}</Button>
          )}
          {event.state === 'OPEN' && !hasEventPassed && (
            <Button onClick={() => freezeMutation.mutate()}>{t('freezeRsvps')}</Button>
          )}
          {event.state === 'FROZEN' && !hasEventPassed && (
            <Link href={`/admin/events/${eventId}/draw`}>
              <Button>{t('generateDraw')}</Button>
            </Link>
          )}
          {event.state === 'DRAWN' && !hasEventPassed && (
            <Link href={`/admin/events/${eventId}/draw/view`}>
              <Button variant="outline">{t('viewEditDraw')}</Button>
            </Link>
          )}
          {event.state === 'PUBLISHED' && !hasEventPassed && (
            <Link href={`/admin/events/${eventId}/draw/view`}>
              <Button variant="outline">{t('viewEditDraw')}</Button>
            </Link>
          )}
          {event.state === 'PUBLISHED' && hasEventPassed && (
            <Link href={`/admin/events/${eventId}/results`}>
              <Button>{t('enterResults')}</Button>
            </Link>
          )}
          <Button variant="destructive" onClick={handleDeleteEvent} disabled={isDeleting}>
            <Trash2 className="h-4 w-4" />
            {isDeleting ? t('deleting') : t('deleteEvent')}
          </Button>
        </div>
      </div>

      {/* Show draw if it exists, otherwise show confirmed players */}
      {draw ? (
        <div className="space-y-6">
          <DrawSummary draw={draw} />

          {/* Always show waitlist if there are waitlisted players */}
          {(event.waitlistCount > 0 || event.waitlistedPlayers?.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {t('waitlist')} ({event.waitlistCount || event.waitlistedPlayers?.length || 0})
                </CardTitle>
                <CardDescription>{t('playersWaitingForSpot')}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {event.waitlistedPlayers && event.waitlistedPlayers.length > 0 ? (
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
                ) : (
                  <p className="text-sm text-muted-foreground">No players on waitlist</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('confirmedPlayers')} ({event.confirmedCount})
              </CardTitle>
              <CardDescription>
                {t('spotsRemaining', { count: event.capacity - event.confirmedCount })}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {event.confirmedPlayers?.map((player: Player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <span>{player.name}</span>
                    <span className="text-sm text-muted-foreground">{player.rating}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {t('waitlist')} ({event.waitlistCount})
              </CardTitle>
              <CardDescription>{t('playersWaitingForSpot')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {event.waitlistedPlayers?.map((player: WaitlistedPlayer) => (
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
        </div>
      )}

      {/* Delete Event Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmation')}</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this event and all associated data. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setIsDeleting(true);
                deleteMutation.mutate();
                setShowDeleteDialog(false);
              }}
            >
              {t('deleteEvent')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Draw Summary Component
function DrawSummary({ draw }: { draw: Draw }) {
  // Group assignments by tier and round
  const masterAssignments = draw.assignments?.filter((a) => a.tier === 'MASTERS') || [];
  const explorerAssignments = draw.assignments?.filter((a) => a.tier === 'EXPLORERS') || [];

  const mastersRounds: Record<number, Assignment[]> = {};
  masterAssignments.forEach((assignment) => {
    if (!mastersRounds[assignment.round]) {
      mastersRounds[assignment.round] = [];
    }
    mastersRounds[assignment.round].push(assignment);
  });

  const explorersRounds: Record<number, Assignment[]> = {};
  explorerAssignments.forEach((assignment) => {
    if (!explorersRounds[assignment.round]) {
      explorersRounds[assignment.round] = [];
    }
    explorersRounds[assignment.round].push(assignment);
  });

  return (
    <div className="space-y-6">
      {/* Masters Draw */}
      {Object.keys(mastersRounds).length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Masters</h2>
            {draw.event?.tierRules?.mastersTimeSlot && (
              <Badge variant="secondary" className="text-sm">
                <Clock className="mr-2 h-4 w-4" /> {draw.event.tierRules.mastersTimeSlot.startsAt} -{' '}
                {draw.event.tierRules.mastersTimeSlot.endsAt}
              </Badge>
            )}
          </div>
          {Object.entries(mastersRounds).map(([round, assignments]) => (
            <Card key={`masters-${round}`}>
              <CardHeader>
                <CardTitle>Round {round}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignments.map((assignment) => (
                    <AssignmentSummaryCard key={assignment.id} assignment={assignment} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Explorers Draw */}
      {Object.keys(explorersRounds).length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Explorers</h2>
            {draw.event?.tierRules?.explorersTimeSlot && (
              <Badge variant="secondary" className="text-sm">
                <Clock className="mr-2 h-4 w-4" /> {draw.event.tierRules.explorersTimeSlot.startsAt}{' '}
                - {draw.event.tierRules.explorersTimeSlot.endsAt}
              </Badge>
            )}
          </div>
          {Object.entries(explorersRounds).map(([round, assignments]) => (
            <Card key={`explorers-${round}`}>
              <CardHeader>
                <CardTitle>Round {round}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignments.map((assignment) => (
                    <AssignmentSummaryCard key={assignment.id} assignment={assignment} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Assignment Summary Card (simplified, read-only version)
function AssignmentSummaryCard({ assignment }: { assignment: Assignment }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="mb-3">
        <Badge variant="outline">{assignment.court?.label || `Court ${assignment.courtId}`}</Badge>
      </div>
      <div className="grid grid-cols-2 divide-x">
        <div className="pr-4">
          <p className="text-sm font-medium mb-2">Team A</p>
          <div className="space-y-1">
            {assignment.teamA?.map((player) => (
              <div key={player.id} className="flex items-center justify-between text-sm">
                <span>{player.name}</span>
                <span className="text-xs text-muted-foreground">{player.rating}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="pl-4">
          <p className="text-sm font-medium mb-2">Team B</p>
          <div className="space-y-1">
            {assignment.teamB?.map((player) => (
              <div key={player.id} className="flex items-center justify-between text-sm">
                <span>{player.name}</span>
                <span className="text-xs text-muted-foreground">{player.rating}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
