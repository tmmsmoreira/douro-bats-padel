'use client';

import { useState } from 'react';
import { useQuery, UseMutationResult } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Accordion } from '@/components/ui/accordion';
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
import { TierAccordionItem } from './tier-accordion-item';
import { EditAssignmentDialog } from './edit-assignment-dialog';

export function AdminDrawView({ eventId }: { eventId: string }) {
  const t = useTranslations('adminDrawView');
  const { data: session } = useSession();
  const authFetch = useAuthFetch();
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

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
        return await authFetch.get(`/events/${eventId}?includeUnpublished=true`);
      } catch {
        return null;
      }
    },
    enabled: !!session?.accessToken,
  });

  // Use custom hook for mutation
  const updateAssignmentMutation = useUpdateAssignment(eventId, () => {
    setEditingAssignment(null);
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
          editingAssignment={editingAssignment}
          setEditingAssignment={setEditingAssignment}
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
  editingAssignment: Assignment | null;
  setEditingAssignment: (assignment: Assignment | null) => void;
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
  editingAssignment,
  setEditingAssignment,
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
  const handleEditTeam = (assignmentIds: string[]) => {
    const assignment = draw.assignments.find((a) => assignmentIds.includes(a.id));
    if (assignment) setEditingAssignment(assignment);
  };

  return (
    <div className="space-y-6">
      {/* Tier Sections */}
      <Accordion type="single" collapsible defaultValue="masters" className="space-y-4">
        <TierAccordionItem
          value="masters"
          tier="MASTERS"
          tierName={t('masters')}
          assignments={masterAssignments}
          rounds={mastersRounds}
          timeSlot={draw.event.tierRules?.mastersTimeSlot}
          eventDate={draw.event.date}
          teamsCount={mastersTeamsCount}
          fieldsCount={mastersFieldsCount}
          canEdit={!eventPassed}
          onEditTeam={(_, assignmentIds) => handleEditTeam(assignmentIds)}
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
            round: (round) => t('round', { number: round }),
            courtLabel: (courtId) => t('court', { id: courtId }),
          }}
        />

        <TierAccordionItem
          value="explorers"
          tier="EXPLORERS"
          tierName={t('explorers')}
          assignments={explorerAssignments}
          rounds={explorersRounds}
          timeSlot={draw.event.tierRules?.explorersTimeSlot}
          eventDate={draw.event.date}
          teamsCount={explorersTeamsCount}
          fieldsCount={explorersFieldsCount}
          canEdit={!eventPassed}
          onEditTeam={(_, assignmentIds) => handleEditTeam(assignmentIds)}
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
            round: (round) => t('round', { number: round }),
            courtLabel: (courtId) => t('court', { id: courtId }),
          }}
        />
      </Accordion>

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
          allTierPlayers={getUniquePlayers(
            draw.assignments.filter((a) => a.tier === editingAssignment.tier)
          )}
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
    </div>
  );
}
