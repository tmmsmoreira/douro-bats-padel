import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface MatchCardPlayer {
  id: string;
  name: string;
  rating?: number;
  ratingDelta?: number;
  profilePhoto?: string | null;
}

interface MatchCardProps {
  courtLabel: string;
  teamA: MatchCardPlayer[];
  teamB: MatchCardPlayer[];
  teamALabel: string;
  teamBLabel: string;
  centerContent: React.ReactNode;
  headerExtra?: React.ReactNode;
  className?: string;
  teamAClassName?: string;
  teamBClassName?: string;
  footer?: React.ReactNode;
}

function getPlayerInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function PlayerRow({ player }: { player: MatchCardPlayer }) {
  return (
    <div className="flex items-center gap-2 w-full">
      <Avatar className="h-6 w-6">
        <AvatarImage src={player.profilePhoto || undefined} alt={player.name || 'Player'} />
        <AvatarFallback className="gradient-primary text-xs">
          {player.name ? getPlayerInitials(player.name) : '?'}
        </AvatarFallback>
      </Avatar>
      <span className="font-medium flex-1 min-w-0">{player.name}</span>
      {player.rating != null && (
        <span className="text-sm text-muted-foreground ml-auto tabular-nums">{player.rating}</span>
      )}
      {player.ratingDelta != null && player.ratingDelta !== 0 && (
        <span
          className={`flex items-center gap-0.5 text-xs tabular-nums ${player.ratingDelta > 0 ? 'text-green-600' : 'text-red-500'}`}
        >
          {player.ratingDelta > 0 ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {player.ratingDelta > 0 ? '+' : ''}
          {player.ratingDelta}
        </span>
      )}
    </div>
  );
}

export function MatchCard({
  courtLabel,
  teamA,
  teamB,
  teamALabel,
  teamBLabel,
  centerContent,
  headerExtra,
  className,
  teamAClassName,
  teamBClassName,
  footer,
}: MatchCardProps) {
  return (
    <div className={`bg-muted/50 rounded-lg p-4 border space-y-4 ${className || ''}`}>
      {/* Court Label */}
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center justify-center gap-2">
          <Badge variant="outline" className="bg-white">
            {courtLabel}
          </Badge>
        </div>
        {headerExtra}
      </div>

      {/* Match Display */}
      <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] gap-4 md:items-center">
        {/* Team A */}
        <div className={`flex flex-col gap-2 px-4 ${teamAClassName || ''}`}>
          <div className="flex items-center gap-2 order-2 md:order-1">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase font-semibold">
              {teamALabel}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="space-y-1 flex flex-col items-center order-1 md:order-2">
            {teamA.map((player) => (
              <PlayerRow key={player.id} player={player} />
            ))}
          </div>
        </div>

        {/* Center */}
        <div className="flex items-center justify-center">{centerContent}</div>

        {/* Team B */}
        <div className={`flex flex-col gap-2 px-4 ${teamBClassName || ''}`}>
          <div className="flex items-center gap-2 order-1 md:order-1">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase font-semibold">
              {teamBLabel}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="space-y-1 flex flex-col items-center order-2 md:order-2">
            {teamB.map((player) => (
              <PlayerRow key={player.id} player={player} />
            ))}
          </div>
        </div>
      </div>

      {footer}
    </div>
  );
}
