import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayerListItem } from '@/components/shared/player-list-item';

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
            {spotsRemaining > 0 ? (
              <Badge variant="secondary">{capacityBadgeText}</Badge>
            ) : (
              <Badge variant="default">{fullCapacityText}</Badge>
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
      <CardContent className="pt-6">
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
                />
              ) : (
                <div
                  key={player.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  {showIndex && (
                    <span className="text-2xl font-bold text-muted-foreground w-8">
                      #{index + 1}
                    </span>
                  )}
                  <span className="flex-1">{player.name}</span>
                  <span
                    className={
                      showIndex
                        ? 'text-2xl font-bold text-muted-foreground'
                        : 'text-sm text-muted-foreground'
                    }
                  >
                    {player.rating}
                  </span>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}
