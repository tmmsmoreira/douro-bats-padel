'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Pencil,
  Trash2,
  MapPin,
  Calendar,
  RefreshCw,
  Send,
  ArchiveRestore,
  Clock,
} from 'lucide-react';
import { ArrowLeftIcon, ArrowLeftIconHandle } from 'lucide-animated';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  tier: string;
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
  event: {
    id: string;
    title: string;
    date: string;
    startsAt: string;
    endsAt: string;
    state: string;
    venue?: {
      id: string;
      name: string;
      courts: Array<{
        id: string;
        label: string;
      }>;
    };
    tierRules?: {
      mastersTimeSlot?: {
        startsAt: string;
        endsAt: string;
        courtIds?: string[];
      };
      explorersTimeSlot?: {
        startsAt: string;
        endsAt: string;
        courtIds?: string[];
      };
    };
  };
  assignments: Assignment[];
}

export function AdminDrawView({ eventId }: { eventId: string }) {
  const t = useTranslations('adminDrawView');
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const arrowLeftIconRef = useRef<ArrowLeftIconHandle>(null);

  const { data: draw, isLoading } = useQuery<Draw>({
    queryKey: ['draw', eventId],
    queryFn: async () => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }
      const res = await fetch(`${API_URL}/draws/events/${eventId}`, { headers });
      if (!res.ok) throw new Error(t('errorFetchingDraw'));
      return res.json();
    },
  });

  // Fetch event data to get waitlist
  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }
      const res = await fetch(`${API_URL}/events/${eventId}?includeUnpublished=true`, { headers });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: async ({
      assignmentId,
      teamA,
      teamB,
    }: {
      assignmentId: string;
      teamA: string[];
      teamB: string[];
    }) => {
      if (!session?.accessToken) throw new Error(t('notAuthenticated'));

      const res = await fetch(`${API_URL}/draws/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ teamA, teamB }),
      });

      if (!res.ok) throw new Error(t('errorUpdatingAssignment', { message: '' }));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draw', eventId] });
      setEditingAssignment(null);
      toast.success(t('assignmentUpdated'));
    },
    onError: (error: Error) => {
      toast.error(t('errorUpdatingAssignment', { message: error.message }));
    },
  });

  const publishDrawMutation = useMutation({
    mutationFn: async () => {
      if (!session?.accessToken) throw new Error(t('notAuthenticated'));

      const res = await fetch(`${API_URL}/draws/events/${eventId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) throw new Error(t('errorPublishingDraw', { message: '' }));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draw', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      toast.success(t('drawPublished'));
    },
    onError: (error: Error) => {
      toast.error(t('errorPublishingDraw', { message: error.message }));
    },
  });

  const unpublishDrawMutation = useMutation({
    mutationFn: async () => {
      if (!session?.accessToken) throw new Error(t('notAuthenticated'));

      const res = await fetch(`${API_URL}/draws/events/${eventId}/unpublish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) throw new Error(t('errorUnpublishingDraw', { message: '' }));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draw', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      toast.success(t('drawUnpublished'));
    },
    onError: (error: Error) => {
      toast.error(t('errorUnpublishingDraw', { message: error.message }));
    },
  });

  const deleteDrawMutation = useMutation({
    mutationFn: async () => {
      if (!session?.accessToken) throw new Error(t('notAuthenticated'));

      const res = await fetch(`${API_URL}/draws/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) throw new Error(t('errorDeletingDraw', { message: '' }));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draw', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      toast.success(t('drawDeleted'));
      // Redirect to the generate draw page
      router.push(`/admin/events/${eventId}/draw`);
    },
    onError: (error: Error) => {
      toast.error(t('errorDeletingDraw', { message: error.message }));
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">{t('loading')}</div>;
  }

  if (!draw) {
    return <div className="text-center py-8">{t('notAvailable')}</div>;
  }

  // Group assignments by tier and round
  const masterAssignments = draw.assignments.filter((a) => a.tier === 'MASTERS');
  const explorerAssignments = draw.assignments.filter((a) => a.tier === 'EXPLORERS');

  const groupByRound = (assignments: Assignment[]) => {
    return assignments.reduce(
      (acc, assignment) => {
        if (!acc[assignment.round]) {
          acc[assignment.round] = [];
        }
        acc[assignment.round].push(assignment);
        return acc;
      },
      {} as Record<number, Assignment[]>
    );
  };

  const mastersRounds = groupByRound(masterAssignments);
  const explorersRounds = groupByRound(explorerAssignments);

  // Check if event has passed
  const eventEndTime = new Date(draw.event.endsAt);
  const hasEventPassed = eventEndTime < new Date();

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link
          href={`/admin/events/${eventId}`}
          onMouseEnter={() => arrowLeftIconRef.current?.startAnimation()}
        >
          <Button variant="ghost" size="sm">
            <ArrowLeftIcon ref={arrowLeftIconRef} size={16} />
            {t('backToEvent')}
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{hasEventPassed ? t('viewDraw') : t('manageDraw')}</h1>
          <p className="text-muted-foreground">{draw.event.title}</p>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(draw.event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            {draw.event.venue && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{draw.event.venue.name}</span>
              </div>
            )}
          </div>
        </div>
        {!hasEventPassed && (
          <div className="flex gap-2 self-end sm:self-auto">
            {draw.event.state !== 'PUBLISHED' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/admin/events/${eventId}/draw`)}
                >
                  <RefreshCw className="h-4 w-4" />
                  {t('generateNew')}
                </Button>
                <Button
                  onClick={() => publishDrawMutation.mutate()}
                  disabled={publishDrawMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                  {publishDrawMutation.isPending ? t('publishing') : t('publish')}
                </Button>
              </>
            )}
            {draw.event.state === 'PUBLISHED' && (
              <Button
                variant="outline"
                onClick={() => unpublishDrawMutation.mutate()}
                disabled={unpublishDrawMutation.isPending}
              >
                <ArchiveRestore className="h-4 w-4" />
                {unpublishDrawMutation.isPending ? t('unpublishing') : t('unpublish')}
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleteDrawMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
              {deleteDrawMutation.isPending ? t('deleting') : t('delete')}
            </Button>
          </div>
        )}
      </div>

      {/* Masters Assignments */}
      {Object.keys(mastersRounds).length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{t('masters')}</h2>
            {draw.event.tierRules?.mastersTimeSlot && (
              <Badge variant="secondary" className="text-sm">
                <Clock className="mr-2 h-4 w-4" /> {draw.event.tierRules.mastersTimeSlot.startsAt} -{' '}
                {draw.event.tierRules.mastersTimeSlot.endsAt}
              </Badge>
            )}
          </div>
          {Object.entries(mastersRounds).map(([round, assignments]) => (
            <Card key={`masters-${round}`}>
              <CardHeader>
                <CardTitle>{t('round', { number: round })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      onEdit={() => setEditingAssignment(assignment)}
                      canEdit={!hasEventPassed}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Explorers Assignments */}
      {Object.keys(explorersRounds).length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{t('explorers')}</h2>
            {draw.event.tierRules?.explorersTimeSlot && (
              <Badge variant="secondary" className="text-sm">
                <Clock className="mr-2 h-4 w-4" />
                {draw.event.tierRules.explorersTimeSlot.startsAt} -{' '}
                {draw.event.tierRules.explorersTimeSlot.endsAt}
              </Badge>
            )}
          </div>
          {Object.entries(explorersRounds).map(([round, assignments]) => (
            <Card key={`explorers-${round}`}>
              <CardHeader>
                <CardTitle>{t('round', { number: round })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      onEdit={() => setEditingAssignment(assignment)}
                      canEdit={!hasEventPassed}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Waitlist Section */}
      {event && (event.waitlistCount > 0 || event.waitlistedPlayers?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t('waitlist', {
                count: event.waitlistCount || event.waitlistedPlayers?.length || 0,
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
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
              <p className="text-sm text-muted-foreground">{t('noPlayersOnWaitlist')}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      {editingAssignment && (
        <EditAssignmentDialog
          assignment={editingAssignment}
          onClose={() => setEditingAssignment(null)}
          onSave={(teamA, teamB) => {
            updateAssignmentMutation.mutate({
              assignmentId: editingAssignment.id,
              teamA,
              teamB,
            });
          }}
          isSaving={updateAssignmentMutation.isPending}
        />
      )}

      {/* Delete Draw Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDrawTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteDrawDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                deleteDrawMutation.mutate();
                setShowDeleteDialog(false);
              }}
            >
              {t('deleteDraw')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AssignmentCard({
  assignment,
  onEdit,
  canEdit = true,
}: {
  assignment: Assignment;
  onEdit: () => void;
  canEdit?: boolean;
}) {
  const t = useTranslations('adminDrawView');

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <Badge variant="outline">
          {assignment.court?.label || t('court', { id: assignment.courtId })}
        </Badge>
        {canEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 divide-x">
        <div className="pr-4">
          <p className="text-sm font-medium mb-2">{t('teamA')}</p>
          <div className="space-y-1">
            {assignment.teamA.map((player) => (
              <div key={player.id} className="flex items-center justify-between text-sm">
                <span>{player.name}</span>
                <span className="text-xs text-muted-foreground">{player.rating}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="pl-4">
          <p className="text-sm font-medium mb-2">{t('teamB')}</p>
          <div className="space-y-1">
            {assignment.teamB.map((player) => (
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

function EditAssignmentDialog({
  assignment,
  onClose,
  onSave,
  isSaving,
}: {
  assignment: Assignment;
  onClose: () => void;
  onSave: (teamA: string[], teamB: string[]) => void;
  isSaving: boolean;
}) {
  const t = useTranslations('adminDrawView');
  const [teamA, setTeamA] = useState<string[]>(assignment.teamA.map((p) => p.id));
  const [teamB, setTeamB] = useState<string[]>(assignment.teamB.map((p) => p.id));

  const allPlayers = [...assignment.teamA, ...assignment.teamB];

  const swapPlayer = (playerId: string) => {
    if (teamA.includes(playerId)) {
      setTeamA(teamA.filter((id) => id !== playerId));
      setTeamB([...teamB, playerId]);
    } else {
      setTeamB(teamB.filter((id) => id !== playerId));
      setTeamA([...teamA, playerId]);
    }
  };

  const handleSave = () => {
    if (teamA.length !== 2 || teamB.length !== 2) {
      toast.error(t('teamValidationError'));
      return;
    }

    // Check if teams have changed
    const originalTeamA = assignment.teamA.map((p) => p.id).sort();
    const originalTeamB = assignment.teamB.map((p) => p.id).sort();
    const newTeamA = [...teamA].sort();
    const newTeamB = [...teamB].sort();

    const hasChanges =
      JSON.stringify(originalTeamA) !== JSON.stringify(newTeamA) ||
      JSON.stringify(originalTeamB) !== JSON.stringify(newTeamB);

    if (!hasChanges) {
      toast.info(t('noChangesToSave') || 'No changes to save');
      onClose();
      return;
    }

    onSave(teamA, teamB);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('editAssignment')}</DialogTitle>
          <DialogDescription>{t('editAssignmentDescription')}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium">
              {t('teamA')} ({teamA.length}/2)
            </h3>
            <div className="space-y-2">
              {allPlayers
                .filter((p) => teamA.includes(p.id))
                .map((player) => (
                  <button
                    key={player.id}
                    onClick={() => swapPlayer(player.id)}
                    className="w-full p-3 border rounded-lg hover:bg-secondary transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{player.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {player.tier}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{player.rating}</span>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">
              {t('teamB')} ({teamB.length}/2)
            </h3>
            <div className="space-y-2">
              {allPlayers
                .filter((p) => teamB.includes(p.id))
                .map((player) => (
                  <button
                    key={player.id}
                    onClick={() => swapPlayer(player.id)}
                    className="w-full p-3 border rounded-lg hover:bg-secondary transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{player.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {player.tier}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{player.rating}</span>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || teamA.length !== 2 || teamB.length !== 2}
          >
            {isSaving ? t('saving') : t('saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
