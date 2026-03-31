import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { Assignment } from '@/components/shared/draw';

interface PlayerSelectionColumnProps {
  team: 'A' | 'B';
  teamPlayers: string[];
  otherTeamPlayers: string[];
  allPlayers: Assignment['teamA'];
  onTogglePlayer: (playerId: string) => void;
  teamLabel: string;
  bgColor: string;
  selectedColor: string;
}

export function PlayerSelectionColumn({
  teamPlayers,
  otherTeamPlayers,
  allPlayers,
  onTogglePlayer,
  teamLabel,
  bgColor,
  selectedColor,
}: PlayerSelectionColumnProps) {
  return (
    <div className="space-y-2">
      <h3 className={`font-medium text-center p-2 ${bgColor} rounded-lg`}>
        {teamLabel} ({teamPlayers.length}/2)
      </h3>
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {allPlayers.map((player) => {
          const isSelected = teamPlayers.includes(player.id);
          const isInOtherTeam = otherTeamPlayers.includes(player.id);
          const canSelect = !isInOtherTeam && teamPlayers.length < 2;

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
                    : 'hover:bg-secondary'
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
                <span className="text-xs text-muted-foreground shrink-0">{player.rating}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
