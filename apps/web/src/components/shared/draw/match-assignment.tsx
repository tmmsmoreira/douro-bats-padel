import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { MatchCard } from './match-card';
import type { Assignment } from './types';

interface MatchAssignmentProps {
  assignment: Assignment;
  onEdit?: (assignmentId: string) => void;
  canEdit?: boolean;
  courtLabel: (courtId: string) => string;
  teamANumber?: number;
  teamBNumber?: number;
  teamLabel?: string;
}

export function MatchAssignment({
  assignment,
  onEdit,
  canEdit,
  courtLabel,
  teamANumber,
  teamBNumber,
  teamLabel = 'TEAM',
}: MatchAssignmentProps) {
  return (
    <MatchCard
      courtLabel={assignment.court?.label || courtLabel(assignment.courtId)}
      teamA={assignment.teamA}
      teamB={assignment.teamB}
      teamALabel={teamANumber ? `${teamLabel} ${teamANumber}` : 'Team A'}
      teamBLabel={teamBNumber ? `${teamLabel} ${teamBNumber}` : 'Team B'}
      centerContent={<div className="text-2xl font-bold text-muted-foreground">vs</div>}
      headerExtra={
        canEdit && onEdit ? (
          <Button variant="ghost" size="sm" onClick={() => onEdit(assignment.id)}>
            <Pencil className="h-4 w-4" />
          </Button>
        ) : undefined
      }
    />
  );
}
