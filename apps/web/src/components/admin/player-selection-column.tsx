import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { Assignment } from '@padel/types';

interface PlayerSelectionColumnProps {
  teamPlayers: string[];
  otherTeamPlayers: string[];
  allPlayers: Assignment['teamA'];
  onTogglePlayer: (playerId: string) => void;
  teamLabel: string;
  selectedColor: string;
  playerTeamNumberMap?: Map<string, number>;
  teamText?: string;
}

export function PlayerSelectionColumn({
  teamPlayers,
  otherTeamPlayers,
  allPlayers,
  onTogglePlayer,
  teamLabel,
  selectedColor,
  playerTeamNumberMap,
  teamText = 'Team',
}: PlayerSelectionColumnProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-center p-2">
        {teamLabel} ({teamPlayers.length}/2)
      </h3>
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {allPlayers.map((player) => {
          const isSelected = teamPlayers.includes(player.id);
          const isInOtherTeam = otherTeamPlayers.includes(player.id);
          const canSelect = !isInOtherTeam && teamPlayers.length < 2;
          const teamNumber = playerTeamNumberMap?.get(player.id);

          return (
            <button
              key={player.id}
              onClick={() => onTogglePlayer(player.id)}
              disabled={!isSelected && !canSelect}
              className={`w-full p-2 border rounded-lg transition-colors text-left ${
                isSelected
                  ? selectedColor
                  : isInOtherTeam
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-secondary hover:text-secondary-foreground'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarImage
                      src={player.profilePhoto || undefined}
                      alt={player.name || 'Player'}
                    />
                    <AvatarFallback className="gradient-primary text-xs">
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
                  <span className="text-sm font-medium truncate">{player.name}</span>
                </div>
                <div className="flex items-center uppercase gap-6 shrink-0">
                  {teamNumber !== undefined && (
                    <span className="text-xs text-muted-foreground font-medium tabular-nums">
                      {teamText} {teamNumber}
                    </span>
                  )}
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {player.rating}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
