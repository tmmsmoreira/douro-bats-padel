import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayerListItem } from '@/components/shared/player-list-item';
import { X } from 'lucide-react';

interface WaitlistedPlayerBase {
  id: string;
  name: string;
  rating: number;
  position: number;
  profilePhoto?: string | null;
}

interface WaitlistSectionProps {
  players: WaitlistedPlayerBase[];
  showAvatar?: boolean;
  title: string;
  avatarSize?: 'sm' | 'md';
  onRemovePlayer?: (playerId: string) => void;
  isRemoving?: boolean;
  showDeleteAction?: boolean;
}

export function WaitlistSection({
  players,
  showAvatar = false,
  title,
  avatarSize = 'sm',
  onRemovePlayer,
  isRemoving = false,
  showDeleteAction = false,
}: WaitlistSectionProps) {
  if (!players || players.length === 0) {
    return null;
  }

  return (
    <Card className="glass-card">
      <CardHeader className="bg-amber-50 dark:bg-amber-950/30">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {players.map((player) =>
            showAvatar ? (
              <PlayerListItem
                key={player.id}
                id={player.id}
                name={player.name}
                rating={player.rating}
                profilePhoto={player.profilePhoto}
                position={player.position}
                variant="leaderboard"
                avatarSize={avatarSize === 'md' ? 'md' : 'sm'}
                onDelete={onRemovePlayer}
                isDeleting={isRemoving}
                showDeleteAction={showDeleteAction}
              />
            ) : (
              <div
                key={player.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <span className="flex-1">{player.name}</span>
                <span className="text-sm text-muted-foreground">{player.rating}</span>
                {onRemovePlayer && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemovePlayer(player.id)}
                    disabled={isRemoving}
                    className="shrink-0 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                    title="Remove player"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
