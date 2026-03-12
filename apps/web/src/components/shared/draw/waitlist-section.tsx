import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { WaitlistedPlayer } from './types';

interface WaitlistSectionProps {
  players: WaitlistedPlayer[];
  showAvatar?: boolean;
  title: string;
}

export function WaitlistSection({ players, showAvatar = false, title }: WaitlistSectionProps) {
  if (!players || players.length === 0) {
    return null;
  }

  return (
    <Card className="glass-card">
      <CardHeader className="bg-amber-50 dark:bg-amber-950/30">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div className="flex items-center gap-2">
                <Badge variant="secondary">#{player.position}</Badge>
                {showAvatar && (
                  <Avatar className="h-6 w-6">
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
                )}
                <span>{player.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">{player.rating}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
