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
  tierLabel: string;
  tierBadgeClass?: string;
}

export function MatchAssignment({
  assignment,
  onEdit,
  canEdit,
  courtLabel,
  tierLabel,
  tierBadgeClass,
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
    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
      {/* Campo Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
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
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
        {/* Team A */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground text-center font-semibold">TEAM A</div>
          <div className="space-y-1 flex flex-col items-center">
            {assignment.teamA.map((player) => (
              <div key={player.id} className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={player.profilePhoto || undefined}
                    alt={player.name || 'Player'}
                  />
                  <AvatarFallback className="gradient-primary text-xs">
                    {player.name ? getPlayerInitials(player.name) : '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{player.name}</span>
                <span className="text-sm text-muted-foreground">{player.rating}</span>
              </div>
            ))}
          </div>
        </div>

        {/* VS */}
        <div className="flex items-center justify-center">
          <div className="text-2xl font-bold text-muted-foreground">vs</div>
        </div>

        {/* Team B */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground text-center font-semibold">TEAM B</div>
          <div className="space-y-1 flex flex-col items-center">
            {assignment.teamB.map((player) => (
              <div key={player.id} className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={player.profilePhoto || undefined}
                    alt={player.name || 'Player'}
                  />
                  <AvatarFallback className="gradient-primary text-xs">
                    {player.name ? getPlayerInitials(player.name) : '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{player.name}</span>
                <span className="text-sm text-muted-foreground">{player.rating}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
