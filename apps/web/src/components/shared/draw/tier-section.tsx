import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';
import { MatchAssignment } from './match-assignment';
import type { Assignment, TierTimeSlot } from './types';

interface TierSectionProps {
  tier: 'MASTERS' | 'EXPLORERS';
  rounds: Record<number, Assignment[]>;
  assignments: Assignment[];
  timeSlot?: TierTimeSlot;
  eventDate?: string | Date;
  onEditAssignment?: (assignmentId: string) => void;
  canEdit?: boolean;
  translations: {
    tierName: string;
    round: (round: number) => string;
    courtLabel: (courtId: string) => string;
    team?: string;
  };
}

export function TierSection({
  tier,
  rounds,
  assignments,
  onEditAssignment,
  canEdit,
  translations,
}: TierSectionProps) {
  // Build team-to-number mapping (same logic as TeamList)
  const teamNumberMap = useMemo(() => {
    const teamsMap = new Map<string, number>();
    const uniqueTeams = new Map<string, boolean>();

    assignments.forEach((assignment) => {
      // Process Team A
      if (assignment.teamA.length === 2) {
        const teamKey = assignment.teamA
          .map((p) => p.id)
          .sort()
          .join('-');
        if (!uniqueTeams.has(teamKey)) {
          uniqueTeams.set(teamKey, true);
        }
      }

      // Process Team B
      if (assignment.teamB.length === 2) {
        const teamKey = assignment.teamB
          .map((p) => p.id)
          .sort()
          .join('-');
        if (!uniqueTeams.has(teamKey)) {
          uniqueTeams.set(teamKey, true);
        }
      }
    });

    // Assign numbers based on order
    Array.from(uniqueTeams.keys()).forEach((teamKey, index) => {
      teamsMap.set(teamKey, index + 1);
    });

    return teamsMap;
  }, [assignments]);

  // Helper to get team number from player IDs
  const getTeamNumber = (players: Assignment['teamA']) => {
    if (players.length !== 2) return undefined;
    const teamKey = players
      .map((p) => p.id)
      .sort()
      .join('-');
    return teamNumberMap.get(teamKey);
  };

  if (Object.keys(rounds).length === 0) {
    return null;
  }

  const tierColor = tier === 'MASTERS' ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="space-y-4">
      {translations.tierName && (
        <div className="flex items-center gap-3">
          <div className={`w-2 h-6 ${tierColor} rounded-full`} />
          <h2 className="text-xl font-bold">{translations.tierName}</h2>
        </div>
      )}
      {Object.entries(rounds)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([round, assignments]) => (
          <Card key={`${tier}-${round}`} className="shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">{translations.round(Number(round))}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-1 gap-4">
                {assignments.map((assignment) => (
                  <MatchAssignment
                    key={assignment.id}
                    assignment={assignment}
                    onEdit={onEditAssignment}
                    canEdit={canEdit}
                    courtLabel={translations.courtLabel}
                    teamANumber={getTeamNumber(assignment.teamA)}
                    teamBNumber={getTeamNumber(assignment.teamB)}
                    teamLabel={translations.team}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
