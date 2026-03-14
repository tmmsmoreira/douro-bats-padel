import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
}

export function WaitlistSection({
  players,
  showAvatar = false,
  title,
  avatarSize = 'sm',
}: WaitlistSectionProps) {
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
              <div className="flex items-center gap-2 flex-1">
                <Badge variant="secondary">#{player.position}</Badge>
                {showAvatar && (
                  <Avatar className={avatarSize === 'md' ? 'h-8 w-8' : 'h-6 w-6'}>
                    <AvatarImage
                      src={player.profilePhoto || undefined}
                      alt={player.name || 'Player'}
                    />
                    <AvatarFallback
                      className={`gradient-primary ${avatarSize === 'md' ? 'text-sm' : 'text-xs'}`}
                    >
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
