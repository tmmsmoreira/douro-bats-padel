'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
      if (!res.ok) throw new Error('Failed to fetch draw');
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
      if (!session?.accessToken) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/draws/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ teamA, teamB }),
      });

      if (!res.ok) throw new Error('Failed to update assignment');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draw', eventId] });
      setEditingAssignment(null);
      toast.success('Assignment updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update assignment: ${error.message}`);
    },
  });

  const publishDrawMutation = useMutation({
    mutationFn: async () => {
      if (!session?.accessToken) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/draws/events/${eventId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) throw new Error('Failed to publish draw');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draw', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      toast.success('Draw published successfully! Players have been notified.');
    },
    onError: (error: Error) => {
      toast.error(`Failed to publish draw: ${error.message}`);
    },
  });

  const unpublishDrawMutation = useMutation({
    mutationFn: async () => {
      if (!session?.accessToken) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/draws/events/${eventId}/unpublish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) throw new Error('Failed to unpublish draw');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draw', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      toast.success('Draw unpublished successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to unpublish draw: ${error.message}`);
    },
  });

  const deleteDrawMutation = useMutation({
    mutationFn: async () => {
      if (!session?.accessToken) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/draws/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete draw');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draw', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      toast.success('Draw deleted successfully');
      // Redirect to the generate draw page
      router.push(`/admin/events/${eventId}/draw`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete draw: ${error.message}`);
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading draw...</div>;
  }

  if (!draw) {
    return <div className="text-center py-8">Draw not available yet</div>;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Draw</h1>
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
        <div className="flex gap-2">
          {draw.event.state !== 'PUBLISHED' && (
            <>
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/events/${eventId}/draw`)}
              >
                <RefreshCw className="h-4 w-4" />
                Generate New
              </Button>
              <Button
                onClick={() => publishDrawMutation.mutate()}
                disabled={publishDrawMutation.isPending}
              >
                <Send className="h-4 w-4" />
                {publishDrawMutation.isPending ? 'Publishing...' : 'Publish'}
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
              {unpublishDrawMutation.isPending ? 'Unpublishing...' : 'Unpublish'}
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleteDrawMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
            {deleteDrawMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Masters Assignments */}
      {Object.keys(mastersRounds).length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Masters</h2>
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
                <CardTitle>Round {round}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      onEdit={() => setEditingAssignment(assignment)}
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
            <h2 className="text-2xl font-bold">Explorers</h2>
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
                <CardTitle>Round {round}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      onEdit={() => setEditingAssignment(assignment)}
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
              Waitlist ({event.waitlistCount || event.waitlistedPlayers?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {event.waitlistedPlayers && event.waitlistedPlayers.length > 0 ? (
              <div className="space-y-2">
                {event.waitlistedPlayers.map((player: any) => (
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this draw. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                deleteDrawMutation.mutate();
                setShowDeleteDialog(false);
              }}
            >
              Delete Draw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AssignmentCard({ assignment, onEdit }: { assignment: Assignment; onEdit: () => void }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <Badge variant="outline">{assignment.court?.label || `Court ${assignment.courtId}`}</Badge>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-2 divide-x">
        <div className="pr-4">
          <p className="text-sm font-medium mb-2">Team A</p>
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
          <p className="text-sm font-medium mb-2">Team B</p>
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
      toast.error('Each team must have exactly 2 players');
      return;
    }
    onSave(teamA, teamB);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Assignment</DialogTitle>
          <DialogDescription>
            Click on a player to swap them between teams. Each team must have exactly 2 players.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium">Team A ({teamA.length}/2)</h3>
            <div className="space-y-2">
              {allPlayers
                .filter((p) => teamA.includes(p.id))
                .map((player) => (
                  <button
                    key={player.id}
                    onClick={() => swapPlayer(player.id)}
                    className="w-full p-3 border rounded-lg hover:bg-accent transition-colors text-left"
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
            <h3 className="font-medium">Team B ({teamB.length}/2)</h3>
            <div className="space-y-2">
              {allPlayers
                .filter((p) => teamB.includes(p.id))
                .map((player) => (
                  <button
                    key={player.id}
                    onClick={() => swapPlayer(player.id)}
                    className="w-full p-3 border rounded-lg hover:bg-accent transition-colors text-left"
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
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || teamA.length !== 2 || teamB.length !== 2}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
