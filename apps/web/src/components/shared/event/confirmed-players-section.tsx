import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlayerListItem } from '@/components/shared/player';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { UserCheckIcon } from 'lucide-animated';

interface Player {
  id: string;
  name: string;
  rating: number;
  profilePhoto?: string | null;
}

interface ConfirmedPlayersSectionProps {
  players: Player[];
  confirmedCount: number;
  capacity: number;
  title: string;
  spotsRemainingText: string;
  showAvatar?: boolean;
  showIndex?: boolean;
  headerClassName?: string;
  showCapacityBadge?: boolean;
  capacityBadgeText?: string;
  fullCapacityText?: string;
  emptyMessage?: string;
  canRegister?: boolean;
  onRemovePlayer?: (playerId: string) => void;
  isRemoving?: boolean;
  showDeleteAction?: boolean;
}

export function ConfirmedPlayersSection({
  players,
  confirmedCount,
  capacity,
  title,
  spotsRemainingText,
  showAvatar = true,
  showIndex = false,
  headerClassName,
  showCapacityBadge = false,
  capacityBadgeText,
  fullCapacityText,
  emptyMessage = 'No confirmed players yet',
  canRegister = false,
  onRemovePlayer,
  isRemoving = false,
  showDeleteAction = false,
}: ConfirmedPlayersSectionProps) {
  const spotsRemaining = capacity - confirmedCount;

  return (
    <Card className="glass-card">
      <CardHeader className={headerClassName}>
        {showCapacityBadge ? (
          <div className="flex items-center justify-between">
            <CardTitle>
              {title} ({confirmedCount}/{capacity})
            </CardTitle>

            {canRegister && (
              <>
                {spotsRemaining > 0 ? (
                  <Badge variant="secondary">{capacityBadgeText}</Badge>
                ) : (
                  <Badge variant="default">{fullCapacityText}</Badge>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            <CardTitle>
              {title} ({confirmedCount})
            </CardTitle>
            <CardDescription>{spotsRemainingText}</CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {players && players.length > 0 ? (
          <div className="space-y-2">
            {players.map((player, index) =>
              showAvatar ? (
                <PlayerListItem
                  key={player.id}
                  id={player.id}
                  name={player.name}
                  rating={player.rating}
                  profilePhoto={player.profilePhoto}
                  rank={showIndex ? index + 1 : undefined}
                  variant="leaderboard"
                  onDelete={onRemovePlayer}
                  isDeleting={isRemoving}
                  showDeleteAction={showDeleteAction}
                />
              ) : (
                <div
                  key={player.id}
                  className="flex items-center justify-between gap-2 py-2 border-b last:border-0"
                >
                  {showIndex && (
                    <span className="text-2xl font-bold text-muted-foreground w-8 shrink-0">
                      #{index + 1}
                    </span>
                  )}
                  <span className="flex-1 truncate">{player.name}</span>
                  <span
                    className={cn(
                      'shrink-0',
                      showIndex
                        ? 'text-2xl font-bold text-muted-foreground'
                        : 'text-sm text-muted-foreground'
                    )}
                  >
                    {player.rating}
                  </span>
                  {onRemovePlayer && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemovePlayer(player.id)}
                      disabled={isRemoving}
                      className="shrink-0 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Remove player"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )
            )}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserCheckIcon className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{emptyMessage}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}
