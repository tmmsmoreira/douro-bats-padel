import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Pencil } from 'lucide-react';
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
  const getPlayerInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-muted/50 rounded-lg p-4 border space-y-4">
      {/* Campo Label */}
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center justify-center gap-2">
          <Badge variant="outline">
            {assignment.court?.label || courtLabel(assignment.courtId)}
          </Badge>
        </div>
        {canEdit && onEdit && (
          <Button variant="ghost" size="sm" onClick={() => onEdit(assignment.id)}>
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Match Display */}
      <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] gap-4 md:items-center">
        {/* Team A */}
        <div className="flex flex-col gap-2 px-4">
          <div className="text-xs text-muted-foreground uppercase text-center font-semibold order-2 md:order-1">
            {teamANumber ? `${teamLabel} ${teamANumber}` : 'Team A'}
          </div>
          <div className="space-y-1 flex flex-col items-center order-1 md:order-2">
            {assignment.teamA.map((player) => (
              <div key={player.id} className="flex items-center gap-2 w-full">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={player.profilePhoto || undefined}
                    alt={player.name || 'Player'}
                  />
                  <AvatarFallback className="gradient-primary text-xs">
                    {player.name ? getPlayerInitials(player.name) : '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium flex-1 min-w-0">{player.name}</span>
                <span className="text-sm text-muted-foreground ml-auto">{player.rating}</span>
              </div>
            ))}
          </div>
        </div>

        {/* VS */}
        <div className="flex items-center justify-center">
          <div className="text-2xl font-bold text-muted-foreground">vs</div>
        </div>

        {/* Team B */}
        <div className="flex flex-col gap-2 px-4">
          <div className="text-xs text-muted-foreground text-center font-semibold order-1 md:order-1">
            {teamBNumber ? `${teamLabel.toUpperCase()} ${teamBNumber}` : 'TEAM B'}
          </div>
          <div className="space-y-1 flex flex-col items-center order-2 md:order-2">
            {assignment.teamB.map((player) => (
              <div key={player.id} className="flex items-center gap-2 w-full">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={player.profilePhoto || undefined}
                    alt={player.name || 'Player'}
                  />
                  <AvatarFallback className="gradient-primary text-xs">
                    {player.name ? getPlayerInitials(player.name) : '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium flex-1 min-w-0">{player.name}</span>
                <span className="text-sm text-muted-foreground ml-auto">{player.rating}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
