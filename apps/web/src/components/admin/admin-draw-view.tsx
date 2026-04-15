'use client';

import { useState } from 'react';
import { UseMutationResult } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { BadgeAlertIcon } from 'lucide-animated';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { DataStateWrapper } from '@/components/shared';
import { WaitlistSection, TeamList, TierSection } from '@/components/shared/draw';
import type { Draw, Assignment } from '@/components/shared/draw';
import { TierCollapsibleItem } from '@/components/shared/tier-collapsible-item';
import type { EventWithPlayersSerialized } from '@padel/types';
import { useDraw, useEventDetails, useUpdateAssignment, useIsFromBfcache } from '@/hooks';
import {
  groupByRound,
  getUniqueTeamsCount,
  getFieldsCount,
  filterByTier,
  getUniquePlayers,
  hasEventPassed,
} from '@/lib/draw-utils';
import { GenerateDraw } from './generate-draw';
import { EditTeamDialog } from './edit-team-dialog';

interface AdminDrawContentProps {
  draw: Draw;
  event: EventWithPlayersSerialized | null | undefined;
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

export function AdminDrawView({ eventId }: { eventId: string }) {
  const t = useTranslations('adminDrawView');
  const [editingTeam, setEditingTeam] = useState<{
    assignmentIds: string[];
    assignment: Assignment;
    teamNumber: number;
    teamPlayers: { id: string; name: string; rating: number }[];
  } | null>(null);

  const { data: draw, isLoading, error } = useDraw(eventId);

  // Fetch event data to get waitlist
  const { data: event } = useEventDetails(eventId);

  // Use custom hook for mutation
  const updateAssignmentMutation = useUpdateAssignment(eventId, () => {
    setEditingTeam(null);
  });

  return (
    <DataStateWrapper
      isLoading={isLoading}
      data={draw}
      error={error}
      loadingMessage={t('loading')}
      emptyMessage={t('noDraw')}
      emptyComponent={<GenerateDraw eventId={eventId} />}
      isEmpty={(data) => !data}
      errorComponent={
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BadgeAlertIcon className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{t('notAvailable')}</EmptyTitle>
            <EmptyDescription>
              {error instanceof Error ? error.message : t('noDraw')}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      }
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

// Separate component for admin draw content
function AdminDrawContent({
  draw,
  event,
  editingTeam,
  setEditingTeam,
  updateAssignmentMutation,
  t,
}: AdminDrawContentProps) {
  const isBackNav = useIsFromBfcache();
  const [openTier, setOpenTier] = useState<string | null>(null);
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
    <motion.div
      initial={isBackNav ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: isBackNav ? 0 : 0.3 }}
      className="space-y-4"
    >
      <TierCollapsibleItem
        open={openTier === 'masters'}
        onOpenChange={(open) => setOpenTier(open ? 'masters' : null)}
        tierName={t('masters')}
        tierColor="bg-yellow-500"
        timeSlot={draw.event.tierRules?.mastersTimeSlot}
        badges={[
          `${mastersTeamsCount} ${t('teams')}`,
          `${Object.keys(mastersRounds).length} ${t('rounds')}`,
          `${mastersFieldsCount} ${t('fields')}`,
        ]}
      >
        <div className="space-y-6">
          <TeamList
            assignments={masterAssignments}
            onEditTeam={handleEditTeam}
            canEdit={!eventPassed}
            translations={{
              tierName: t('masters'),
              teamListTitle: t('teamListTitle'),
              teamListDescription: t('teamListDescription'),
              team: t('team'),
              avgRating: t('avgRating'),
            }}
          />
          <TierSection
            tier="MASTERS"
            rounds={mastersRounds}
            assignments={masterAssignments}
            timeSlot={draw.event.tierRules?.mastersTimeSlot}
            eventDate={draw.event.date}
            translations={{
              tierName: t('masters'),
              round: (round: number) => t('round', { number: round }),
              courtLabel: (courtId: string) => t('court', { id: courtId }),
              team: t('team'),
            }}
            canEdit={false}
          />
        </div>
      </TierCollapsibleItem>

      <TierCollapsibleItem
        open={openTier === 'explorers'}
        onOpenChange={(open) => setOpenTier(open ? 'explorers' : null)}
        tierName={t('explorers')}
        tierColor="bg-green-500"
        timeSlot={draw.event.tierRules?.explorersTimeSlot}
        badges={[
          `${explorersTeamsCount} ${t('teams')}`,
          `${Object.keys(explorersRounds).length} ${t('rounds')}`,
          `${explorersFieldsCount} ${t('fields')}`,
        ]}
      >
        <div className="space-y-6">
          <TeamList
            assignments={explorerAssignments}
            onEditTeam={handleEditTeam}
            canEdit={!eventPassed}
            translations={{
              tierName: t('explorers'),
              teamListTitle: t('teamListTitle'),
              teamListDescription: t('teamListDescription'),
              team: t('team'),
              avgRating: t('avgRating'),
            }}
          />
          <TierSection
            tier="EXPLORERS"
            rounds={explorersRounds}
            assignments={explorerAssignments}
            timeSlot={draw.event.tierRules?.explorersTimeSlot}
            eventDate={draw.event.date}
            translations={{
              tierName: t('explorers'),
              round: (round: number) => t('round', { number: round }),
              courtLabel: (courtId: string) => t('court', { id: courtId }),
              team: t('team'),
            }}
            canEdit={false}
          />
        </div>
      </TierCollapsibleItem>

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
    </motion.div>
  );
}
