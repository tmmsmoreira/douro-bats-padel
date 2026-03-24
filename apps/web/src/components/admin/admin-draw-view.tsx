'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Trash2, RefreshCw, Send, ArchiveRestore } from 'lucide-react';
import { ArrowLeftIcon, ArrowLeftIconHandle } from 'lucide-animated';
import { Link } from '@/i18n/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DataStateWrapper } from '@/components/shared';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { DrawHeader, TierSection, WaitlistSection } from '@/components/shared/draw';
import type { Draw, Assignment } from '@/components/shared/draw';
import type { EventWithRSVP } from '@padel/types';
import { useAuthFetch } from '@/hooks/use-api';

export function AdminDrawView({ eventId }: { eventId: string }) {
  const t = useTranslations('adminDrawView');
  const locale = useLocale();
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const authFetch = useAuthFetch();
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const arrowLeftIconRef = useRef<ArrowLeftIconHandle | null>(null);

  const { data: draw, isLoading } = useQuery<Draw>({
    queryKey: ['draw', eventId, session?.accessToken],
    queryFn: async () => {
      try {
        return await authFetch.get<Draw>(`/draws/events/${eventId}`);
      } catch {
        throw new Error(t('errorFetchingDraw'));
      }
    },
    enabled: !!session?.accessToken,
  });

  // Fetch event data to get waitlist
  const { data: event } = useQuery<EventWithRSVP | null>({
    queryKey: ['event', eventId, session?.accessToken],
    queryFn: async () => {
      try {
        return await authFetch.get(`/events/${eventId}?includeUnpublished=true`);
      } catch {
        return null;
      }
    },
    enabled: !!session?.accessToken,
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
      return await authFetch.patch(`/draws/assignments/${assignmentId}`, { teamA, teamB });
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
      return await authFetch.post(`/draws/events/${eventId}/publish`);
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
      return await authFetch.post(`/draws/events/${eventId}/unpublish`);
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
      return await authFetch.delete(`/draws/events/${eventId}`);
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

  return (
    <DataStateWrapper
      isLoading={isLoading}
      data={draw}
      loadingMessage={t('loading')}
      emptyMessage={t('notAvailable')}
    >
      {(draw) => (
        <AdminDrawContent
          draw={draw}
          event={event}
          eventId={eventId}
          editingAssignment={editingAssignment}
          setEditingAssignment={setEditingAssignment}
          showDeleteDialog={showDeleteDialog}
          setShowDeleteDialog={setShowDeleteDialog}
          publishDrawMutation={publishDrawMutation}
          unpublishDrawMutation={unpublishDrawMutation}
          deleteDrawMutation={deleteDrawMutation}
          updateAssignmentMutation={updateAssignmentMutation}
          arrowLeftIconRef={arrowLeftIconRef}
          router={router}
          t={t}
          locale={locale}
        />
      )}
    </DataStateWrapper>
  );
}

interface AdminDrawContentProps {
  draw: Draw;
  event: EventWithRSVP | null | undefined;
  eventId: string;
  editingAssignment: Assignment | null;
  setEditingAssignment: (assignment: Assignment | null) => void;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  publishDrawMutation: UseMutationResult<unknown, Error, void, unknown>;
  unpublishDrawMutation: UseMutationResult<unknown, Error, void, unknown>;
  deleteDrawMutation: UseMutationResult<unknown, Error, void, unknown>;
  updateAssignmentMutation: UseMutationResult<
    unknown,
    Error,
    { assignmentId: string; teamA: string[]; teamB: string[] },
    unknown
  >;
  arrowLeftIconRef: React.RefObject<ArrowLeftIconHandle | null>;
  router: ReturnType<typeof useRouter>;
  t: ReturnType<typeof useTranslations>;
  locale: string;
}

// Separate component for admin draw content
function AdminDrawContent({
  draw,
  event,
  eventId,
  editingAssignment,
  setEditingAssignment,
  showDeleteDialog,
  setShowDeleteDialog,
  publishDrawMutation,
  unpublishDrawMutation,
  deleteDrawMutation,
  updateAssignmentMutation,
  arrowLeftIconRef,
  router,
  t,
  locale,
}: AdminDrawContentProps) {
  // Group assignments by tier and round
  const masterAssignments = draw.assignments.filter((a: Assignment) => a.tier === 'MASTERS');
  const explorerAssignments = draw.assignments.filter((a: Assignment) => a.tier === 'EXPLORERS');

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

      <DrawHeader
        title={draw.event.title}
        date={draw.event.date}
        venue={draw.event.venue}
        locale={locale}
        actions={
          !hasEventPassed ? (
            <>
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
                    onClick={() => publishDrawMutation.mutate(undefined)}
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
                  onClick={() => unpublishDrawMutation.mutate(undefined)}
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
            </>
          ) : undefined
        }
      />

      {/* Masters Assignments */}
      <TierSection
        tier="MASTERS"
        rounds={mastersRounds}
        timeSlot={draw.event.tierRules?.mastersTimeSlot}
        translations={{
          tierName: t('masters'),
          round: (round) => t('round', { number: round }),
          courtLabel: (courtId) => t('court', { id: courtId }),
        }}
        onEditAssignment={(assignmentId) => {
          const assignment = draw.assignments.find((a) => a.id === assignmentId);
          if (assignment) setEditingAssignment(assignment);
        }}
        canEdit={!hasEventPassed}
      />

      {/* Explorers Assignments */}
      <TierSection
        tier="EXPLORERS"
        rounds={explorersRounds}
        timeSlot={draw.event.tierRules?.explorersTimeSlot}
        translations={{
          tierName: t('explorers'),
          round: (round) => t('round', { number: round }),
          courtLabel: (courtId) => t('court', { id: courtId }),
        }}
        onEditAssignment={(assignmentId) => {
          const assignment = draw.assignments.find((a) => a.id === assignmentId);
          if (assignment) setEditingAssignment(assignment);
        }}
        canEdit={!hasEventPassed}
      />

      {/* Waitlist Section */}
      <WaitlistSection
        players={[]}
        title={t('waitlist', {
          count: event?.waitlistCount || 0,
        })}
        showAvatar={true}
      />

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
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={t('deleteDrawTitle')}
        description={t('deleteDrawDescription')}
        confirmText={t('deleteDraw')}
        cancelText={t('cancel')}
        variant="destructive"
        isLoading={deleteDrawMutation.isPending}
        onConfirm={() => {
          deleteDrawMutation.mutate(undefined);
          setShowDeleteDialog(false);
        }}
      />
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
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={player.profilePhoto || undefined}
                            alt={player.name || 'Player'}
                          />
                          <AvatarFallback className="gradient-primary text-sm">
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
                        <span className="font-medium">{player.name}</span>
                      </div>
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
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={player.profilePhoto || undefined}
                            alt={player.name || 'Player'}
                          />
                          <AvatarFallback className="gradient-primary text-sm">
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
                        <span className="font-medium">{player.name}</span>
                      </div>
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
