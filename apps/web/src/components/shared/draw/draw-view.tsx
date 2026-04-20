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
import type { Draw, Assignment, TierTimeSlot } from '@/components/shared/draw';
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
import { GenerateDraw } from '@/components/admin/generate-draw';
import { EditTeamDialog } from '@/components/admin/edit-team-dialog';

interface DrawViewProps {
  eventId: string;
  isEditor?: boolean;
}

export function DrawView({ eventId, isEditor = false }: DrawViewProps) {
  const t = useTranslations(isEditor ? 'adminDrawView' : 'drawView');
  const [editingTeam, setEditingTeam] = useState<{
    assignmentIds: string[];
    assignment: Assignment;
    teamNumber: number;
    teamPlayers: { id: string; name: string; rating: number }[];
  } | null>(null);

  const { data: draw, isLoading, error } = useDraw(eventId);
  const { data: event } = useEventDetails(eventId);

  const updateAssignmentMutation = useUpdateAssignment(eventId, () => {
    setEditingTeam(null);
  });

  return (
    <DataStateWrapper
      isLoading={isLoading}
      data={draw}
      error={error}
      loadingMessage={isEditor ? t('loading') : t('loadingDraw')}
      emptyMessage={isEditor ? t('noDraw') : t('drawNotAvailable')}
      emptyComponent={isEditor ? <GenerateDraw eventId={eventId} /> : undefined}
      isEmpty={isEditor ? (data) => !data : undefined}
      errorComponent={
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BadgeAlertIcon className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{isEditor ? t('notAvailable') : t('drawNotAvailable')}</EmptyTitle>
            <EmptyDescription>
              {isEditor
                ? error instanceof Error
                  ? error.message
                  : t('noDraw')
                : t('drawNotAvailableDescription')}
              {!isEditor && error && (
                <>
                  <br />
                  <span className="text-xs text-destructive mt-2 block">
                    {t('error')}: {error instanceof Error ? error.message : 'Failed to load draw'}
                  </span>
                </>
              )}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      }
    >
      {(draw) => (
        <DrawViewContent
          draw={draw}
          event={event}
          isEditor={isEditor}
          editingTeam={editingTeam}
          setEditingTeam={setEditingTeam}
          updateAssignmentMutation={updateAssignmentMutation}
          t={t}
        />
      )}
    </DataStateWrapper>
  );
}

function DrawViewContent({
  draw,
  event,
  isEditor,
  editingTeam,
  setEditingTeam,
  updateAssignmentMutation,
  t,
}: {
  draw: Draw;
  event: EventWithPlayersSerialized | null | undefined;
  isEditor: boolean;
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
}) {
  const isBackNav = useIsFromBfcache();
  const [openTier, setOpenTier] = useState<string | null>(null);

  const masterAssignments = filterByTier(draw.assignments, 'MASTERS');
  const explorerAssignments = filterByTier(draw.assignments, 'EXPLORERS');

  const mastersRounds = groupByRound(masterAssignments);
  const explorersRounds = groupByRound(explorerAssignments);
  const mastersTeamsCount = getUniqueTeamsCount(masterAssignments);
  const explorersTeamsCount = getUniqueTeamsCount(explorerAssignments);
  const mastersFieldsCount = getFieldsCount(masterAssignments);
  const explorersFieldsCount = getFieldsCount(explorerAssignments);

  const eventPassed = hasEventPassed(draw.event.endsAt);

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

  // Translation key helpers (admin and player translations differ slightly)
  const mastersTierName = isEditor ? t('masters') : t('mastersTier');
  const explorersTierName = isEditor ? t('explorers') : t('explorersTier');

  const renderTier = (
    tierKey: string,
    tierName: string,
    tierColor: string,
    assignments: Assignment[],
    rounds: Record<number, Assignment[]>,
    teamsCount: number,
    fieldsCount: number,
    tier: 'MASTERS' | 'EXPLORERS',
    timeSlot: TierTimeSlot | undefined
  ) => {
    // Player view: hide tier if no assignments
    if (!isEditor && assignments.length === 0) return null;

    return (
      <TierCollapsibleItem
        key={tierKey}
        open={openTier === tierKey}
        onOpenChange={(open) => setOpenTier(open ? tierKey : null)}
        tierName={tierName}
        tierColor={tierColor}
        timeSlot={timeSlot}
        badges={[
          `${teamsCount} ${t('teams')}`,
          `${Object.keys(rounds).length} ${t('rounds')}`,
          `${fieldsCount} ${t('fields')}`,
        ]}
      >
        <div className="space-y-8">
          <TeamList
            assignments={assignments}
            onEditTeam={isEditor ? handleEditTeam : undefined}
            canEdit={isEditor ? !eventPassed : false}
            translations={{
              tierName,
              teamListTitle: t('teamListTitle'),
              teamListDescription: t('teamListDescription'),
              team: t('team'),
              avgRating: t('avgRating'),
            }}
          />
          <TierSection
            tier={tier}
            rounds={rounds}
            assignments={assignments}
            timeSlot={timeSlot}
            eventDate={draw.event.date}
            translations={{
              tierName,
              round: (round: number) =>
                isEditor ? t('round', { number: round }) : t('round', { round }),
              courtLabel: (courtId: string) =>
                isEditor ? t('court', { id: courtId }) : t('courtLabel', { courtId }),
              team: t('team'),
            }}
            canEdit={false}
          />
        </div>
      </TierCollapsibleItem>
    );
  };

  return (
    <motion.div
      initial={isBackNav ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: isBackNav ? 0 : 0.3 }}
      className="space-y-4"
    >
      {renderTier(
        'masters',
        mastersTierName,
        'bg-yellow-500',
        masterAssignments,
        mastersRounds,
        mastersTeamsCount,
        mastersFieldsCount,
        'MASTERS',
        draw.event.tierRules?.mastersTimeSlot
      )}

      {renderTier(
        'explorers',
        explorersTierName,
        'bg-green-500',
        explorerAssignments,
        explorersRounds,
        explorersTeamsCount,
        explorersFieldsCount,
        'EXPLORERS',
        draw.event.tierRules?.explorersTimeSlot
      )}

      {/* Waitlist Section */}
      <WaitlistSection
        players={[]}
        title={
          isEditor
            ? t('waitlist', { count: event?.waitlistCount || 0 })
            : t('waitlist', { count: event?.waitlistCount || 0 })
        }
        showAvatar={true}
      />

      {/* Editor: Edit Team Dialog */}
      {isEditor && editingTeam && (
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
            const originalPlayerIds = editingTeam.teamPlayers.map((p) => p.id).sort();
            const newPlayerIds = [...newTeamPlayers].sort();

            const playersRemoved = originalPlayerIds.filter((id) => !newPlayerIds.includes(id));
            const playersAdded = newPlayerIds.filter((id) => !originalPlayerIds.includes(id));

            const teamsToUpdate = new Map<
              string,
              { assignmentIds: string[]; newPlayers: string[] }
            >();

            const editedTeamKey = originalPlayerIds.join('-');
            teamsToUpdate.set(editedTeamKey, {
              assignmentIds: editingTeam.assignmentIds,
              newPlayers: newTeamPlayers,
            });

            if (playersAdded.length > 0 && playersRemoved.length > 0) {
              const playerAdded = playersAdded[0];
              const playerRemoved = playersRemoved[0];

              const tierAssignments = draw.assignments.filter(
                (a) => a.tier === editingTeam.assignment.tier
              );

              for (const assignment of tierAssignments) {
                if (assignment.teamA.some((p) => p.id === playerAdded)) {
                  const sourceTeamKey = assignment.teamA
                    .map((p) => p.id)
                    .sort()
                    .join('-');

                  if (sourceTeamKey !== editedTeamKey && !teamsToUpdate.has(sourceTeamKey)) {
                    const updatedPlayers = assignment.teamA.map((p) =>
                      p.id === playerAdded ? playerRemoved : p.id
                    );

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

                if (assignment.teamB.some((p) => p.id === playerAdded)) {
                  const sourceTeamKey = assignment.teamB
                    .map((p) => p.id)
                    .sort()
                    .join('-');

                  if (sourceTeamKey !== editedTeamKey && !teamsToUpdate.has(sourceTeamKey)) {
                    const updatedPlayers = assignment.teamB.map((p) =>
                      p.id === playerAdded ? playerRemoved : p.id
                    );

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

            for (const [teamKey, { assignmentIds, newPlayers }] of teamsToUpdate) {
              for (const assignmentId of assignmentIds) {
                const assignment = draw.assignments.find((a) => a.id === assignmentId);
                if (!assignment) continue;

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
                  finalTeamA = newPlayers;
                  finalTeamB = assignment.teamB.map((p) => p.id);
                } else if (teamKey === assignmentTeamBIds) {
                  finalTeamA = assignment.teamA.map((p) => p.id);
                  finalTeamB = newPlayers;
                } else {
                  continue;
                }

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
