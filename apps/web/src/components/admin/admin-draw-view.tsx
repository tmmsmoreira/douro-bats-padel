'use client';

import { useState } from 'react';
import { useQuery, UseMutationResult } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { DataStateWrapper } from '@/components/shared';
import { WaitlistSection } from '@/components/shared/draw';
import type { Draw, Assignment } from '@/components/shared/draw';
import type { EventWithRSVP } from '@padel/types';
import { useAuthFetch, useUpdateAssignment } from '@/hooks';
import {
  groupByRound,
  getUniqueTeamsCount,
  getFieldsCount,
  filterByTier,
  getUniquePlayers,
  hasEventPassed,
} from '@/lib/draw-utils';
import { GenerateDraw } from './generate-draw';
import { TierCollapsibleItem } from './tier-accordion-item';
import { EditTeamDialog } from './edit-team-dialog';

export function AdminDrawView({ eventId }: { eventId: string }) {
  const t = useTranslations('adminDrawView');
  const { data: session } = useSession();
  const authFetch = useAuthFetch();
  const [editingTeam, setEditingTeam] = useState<{
    assignmentIds: string[];
    assignment: Assignment;
    teamNumber: number;
    teamPlayers: { id: string; name: string; rating: number }[];
  } | null>(null);

  const { data: draw, isLoading } = useQuery<Draw | null>({
    queryKey: ['draw', eventId, session?.accessToken],
    queryFn: async () => {
      try {
        return await authFetch.get<Draw>(`/draws/events/${eventId}`);
      } catch {
        return null;
      }
    },
    enabled: !!session?.accessToken,
  });

  // Fetch event data to get waitlist
  const { data: event } = useQuery<EventWithRSVP | null>({
    queryKey: ['event', eventId, session?.accessToken],
    queryFn: async () => {
      try {
        // Backend automatically determines access based on user roles from JWT
        return await authFetch.get(`/events/${eventId}`);
      } catch {
        return null;
      }
    },
    enabled: !!session?.accessToken,
  });

  // Use custom hook for mutation
  const updateAssignmentMutation = useUpdateAssignment(eventId, () => {
    setEditingTeam(null);
  });

  return (
    <DataStateWrapper
      isLoading={isLoading}
      data={draw}
      loadingMessage={t('loading')}
      emptyMessage={t('noDraw')}
      emptyComponent={<GenerateDraw eventId={eventId} />}
      isEmpty={(data) => !data}
    >
      {(draw) => (
        <AdminDrawContent
          draw={draw}
          event={event}
          editingTeam={editingTeam}
          setEditingTeam={setEditingTeam}
          updateAssignmentMutation={updateAssignmentMutation}
          t={t}
        />
      )}
    </DataStateWrapper>
  );
}

interface AdminDrawContentProps {
  draw: Draw;
  event: EventWithRSVP | null | undefined;
  editingTeam: {
    assignmentIds: string[];
    assignment: Assignment;
    teamNumber: number;
    teamPlayers: { id: string; name: string; rating: number }[];
  } | null;
  setEditingTeam: (
    team: {
      assignmentIds: string[];
      assignment: Assignment;
      teamNumber: number;
      teamPlayers: { id: string; name: string; rating: number }[];
    } | null
  ) => void;
  updateAssignmentMutation: UseMutationResult<
    unknown,
    Error,
    { assignmentId: string; teamA: string[]; teamB: string[] },
    unknown
  >;
  t: ReturnType<typeof useTranslations>;
}

// Separate component for admin draw content
function AdminDrawContent({
  draw,
  event,
  editingTeam,
  setEditingTeam,
  updateAssignmentMutation,
  t,
}: AdminDrawContentProps) {
  // Filter assignments by tier
  const masterAssignments = filterByTier(draw.assignments, 'MASTERS');
  const explorerAssignments = filterByTier(draw.assignments, 'EXPLORERS');

  // Calculate tier statistics
  const mastersRounds = groupByRound(masterAssignments);
  const explorersRounds = groupByRound(explorerAssignments);
  const mastersTeamsCount = getUniqueTeamsCount(masterAssignments);
  const explorersTeamsCount = getUniqueTeamsCount(explorerAssignments);
  const mastersFieldsCount = getFieldsCount(masterAssignments);
  const explorersFieldsCount = getFieldsCount(explorerAssignments);

  // Check if event has passed
  const eventPassed = hasEventPassed(draw.event.endsAt);

  // Handle team edit selection
  const handleEditTeam = (
    team: {
      id: string;
      player1: { id: string; name: string; rating: number };
      player2: { id: string; name: string; rating: number };
      avgRating: number;
    },
    assignmentIds: string[],
    teamNumber: number
  ) => {
    const assignment = draw.assignments.find((a) => assignmentIds.includes(a.id));
    if (assignment) {
      setEditingTeam({
        assignmentIds,
        assignment,
        teamNumber,
        teamPlayers: [team.player1, team.player2],
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tier Sections */}
      <div className="space-y-4">
        <TierCollapsibleItem
          defaultOpen={true}
          tier="MASTERS"
          tierName={t('masters')}
          assignments={masterAssignments}
          rounds={mastersRounds}
          timeSlot={draw.event.tierRules?.mastersTimeSlot}
          eventDate={draw.event.date}
          teamsCount={mastersTeamsCount}
          fieldsCount={mastersFieldsCount}
          canEdit={!eventPassed}
          onEditTeam={handleEditTeam}
          tierColor="bg-yellow-500"
          translations={{
            tierName: t('masters'),
            teamListTitle: t('teamListTitle'),
            teamListDescription: t('teamListDescription'),
            team: t('team'),
            avgRating: t('avgRating'),
            teams: t('teams'),
            rounds: t('rounds'),
            fields: t('fields'),
            timeSlot: t('timeSlot'),
            round: (round: number) => t('round', { number: round }),
            courtLabel: (courtId: string) => t('court', { id: courtId }),
          }}
        />

        <TierCollapsibleItem
          defaultOpen={false}
          tier="EXPLORERS"
          tierName={t('explorers')}
          assignments={explorerAssignments}
          rounds={explorersRounds}
          timeSlot={draw.event.tierRules?.explorersTimeSlot}
          eventDate={draw.event.date}
          teamsCount={explorersTeamsCount}
          fieldsCount={explorersFieldsCount}
          canEdit={!eventPassed}
          onEditTeam={handleEditTeam}
          tierColor="bg-green-500"
          translations={{
            tierName: t('explorers'),
            teamListTitle: t('teamListTitle'),
            teamListDescription: t('teamListDescription'),
            team: t('team'),
            avgRating: t('avgRating'),
            teams: t('teams'),
            rounds: t('rounds'),
            fields: t('fields'),
            timeSlot: t('timeSlot'),
            round: (round: number) => t('round', { number: round }),
            courtLabel: (courtId: string) => t('court', { id: courtId }),
          }}
        />
      </div>

      {/* Waitlist Section */}
      <WaitlistSection
        players={[]}
        title={t('waitlist', {
          count: event?.waitlistCount || 0,
        })}
        showAvatar={true}
      />

      {/* Edit Dialog */}
      {editingTeam && (
        <EditTeamDialog
          assignment={editingTeam.assignment}
          allTierPlayers={getUniquePlayers(
            draw.assignments.filter((a) => a.tier === editingTeam.assignment.tier)
          )}
          allTierAssignments={draw.assignments.filter(
            (a) => a.tier === editingTeam.assignment.tier
          )}
          teamNumber={editingTeam.teamNumber}
          teamPlayers={editingTeam.teamPlayers}
          onClose={() => setEditingTeam(null)}
          onSave={async (newTeamPlayers) => {
            // Detect which players were added and removed
            const originalPlayerIds = editingTeam.teamPlayers.map((p) => p.id).sort();
            const newPlayerIds = [...newTeamPlayers].sort();

            const playersRemoved = originalPlayerIds.filter((id) => !newPlayerIds.includes(id));
            const playersAdded = newPlayerIds.filter((id) => !originalPlayerIds.includes(id));

            // Track which teams need updates (by team key)
            const teamsToUpdate = new Map<
              string,
              { assignmentIds: string[]; newPlayers: string[] }
            >();

            // 1. Update the team being edited
            const editedTeamKey = originalPlayerIds.join('-');
            teamsToUpdate.set(editedTeamKey, {
              assignmentIds: editingTeam.assignmentIds,
              newPlayers: newTeamPlayers,
            });

            // 2. If a player was added from another team, find that team and update it
            if (playersAdded.length > 0 && playersRemoved.length > 0) {
              const playerAdded = playersAdded[0];
              const playerRemoved = playersRemoved[0];

              // Find which team currently has the player we're adding
              const tierAssignments = draw.assignments.filter(
                (a) => a.tier === editingTeam.assignment.tier
              );

              for (const assignment of tierAssignments) {
                // Check Team A
                if (assignment.teamA.some((p) => p.id === playerAdded)) {
                  const sourceTeamKey = assignment.teamA
                    .map((p) => p.id)
                    .sort()
                    .join('-');

                  // Don't process the same team twice
                  if (sourceTeamKey !== editedTeamKey && !teamsToUpdate.has(sourceTeamKey)) {
                    // Replace the player we're taking with the player we're giving
                    const updatedPlayers = assignment.teamA.map((p) =>
                      p.id === playerAdded ? playerRemoved : p.id
                    );

                    // Find all assignments with this team
                    const sourceTeamAssignmentIds: string[] = [];
                    for (const a of tierAssignments) {
                      const aTeamAKey = a.teamA
                        .map((p) => p.id)
                        .sort()
                        .join('-');
                      const aTeamBKey = a.teamB
                        .map((p) => p.id)
                        .sort()
                        .join('-');
                      if (aTeamAKey === sourceTeamKey || aTeamBKey === sourceTeamKey) {
                        sourceTeamAssignmentIds.push(a.id);
                      }
                    }

                    teamsToUpdate.set(sourceTeamKey, {
                      assignmentIds: sourceTeamAssignmentIds,
                      newPlayers: updatedPlayers,
                    });
                  }
                  break;
                }

                // Check Team B
                if (assignment.teamB.some((p) => p.id === playerAdded)) {
                  const sourceTeamKey = assignment.teamB
                    .map((p) => p.id)
                    .sort()
                    .join('-');

                  // Don't process the same team twice
                  if (sourceTeamKey !== editedTeamKey && !teamsToUpdate.has(sourceTeamKey)) {
                    // Replace the player we're taking with the player we're giving
                    const updatedPlayers = assignment.teamB.map((p) =>
                      p.id === playerAdded ? playerRemoved : p.id
                    );

                    // Find all assignments with this team
                    const sourceTeamAssignmentIds: string[] = [];
                    for (const a of tierAssignments) {
                      const aTeamAKey = a.teamA
                        .map((p) => p.id)
                        .sort()
                        .join('-');
                      const aTeamBKey = a.teamB
                        .map((p) => p.id)
                        .sort()
                        .join('-');
                      if (aTeamAKey === sourceTeamKey || aTeamBKey === sourceTeamKey) {
                        sourceTeamAssignmentIds.push(a.id);
                      }
                    }

                    teamsToUpdate.set(sourceTeamKey, {
                      assignmentIds: sourceTeamAssignmentIds,
                      newPlayers: updatedPlayers,
                    });
                  }
                  break;
                }
              }
            }

            // 3. Apply all updates
            for (const [teamKey, { assignmentIds, newPlayers }] of teamsToUpdate) {
              for (const assignmentId of assignmentIds) {
                const assignment = draw.assignments.find((a) => a.id === assignmentId);
                if (!assignment) continue;

                // Check if this team is teamA or teamB in this specific assignment
                const assignmentTeamAIds = assignment.teamA
                  .map((p) => p.id)
                  .sort()
                  .join('-');
                const assignmentTeamBIds = assignment.teamB
                  .map((p) => p.id)
                  .sort()
                  .join('-');

                let finalTeamA: string[];
                let finalTeamB: string[];

                if (teamKey === assignmentTeamAIds) {
                  // Update teamA
                  finalTeamA = newPlayers;
                  finalTeamB = assignment.teamB.map((p) => p.id);
                } else if (teamKey === assignmentTeamBIds) {
                  // Update teamB
                  finalTeamA = assignment.teamA.map((p) => p.id);
                  finalTeamB = newPlayers;
                } else {
                  // This shouldn't happen, but skip if team not found
                  continue;
                }

                // Update the assignment with the new team composition
                await updateAssignmentMutation.mutateAsync({
                  assignmentId,
                  teamA: finalTeamA,
                  teamB: finalTeamB,
                });
              }
            }
          }}
          isSaving={updateAssignmentMutation.isPending}
        />
      )}
    </div>
  );
}
