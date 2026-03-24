import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Player {
  id: string;
  name: string;
  rating: number;
}

interface WaitlistedPlayer extends Player {
  position: number;
}

interface PlayerListProps {
  title: string;
  description?: string;
  players: Player[];
  showRating?: boolean;
  showPosition?: boolean;
  emptyMessage?: string;
  headerClassName?: string;
}

export function PlayerList({
  title,
  description,
  players,
  showRating = true,
  showPosition = false,
  emptyMessage = 'No players',
  headerClassName,
}: PlayerListProps) {
  return (
    <Card>
      <CardHeader className={headerClassName}>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-6">
        {players && players.length > 0 ? (
          <div className="space-y-2">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between gap-2 py-2 border-b last:border-0"
              >
                {showPosition && (
                  <span className="text-2xl font-bold text-muted-foreground w-8 shrink-0">
                    #{index + 1}
                  </span>
                )}
                {showPosition && 'position' in player && (
                  <Badge variant="secondary">#{(player as WaitlistedPlayer).position}</Badge>
                )}
                <span className={cn('truncate', showPosition ? '' : 'flex-1')}>{player.name}</span>
                {showRating && (
                  <span
                    className={cn(
                      'shrink-0',
                      showPosition
                        ? 'text-2xl font-bold text-muted-foreground'
                        : 'text-sm text-muted-foreground'
                    )}
                  >
                    {player.rating}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}
