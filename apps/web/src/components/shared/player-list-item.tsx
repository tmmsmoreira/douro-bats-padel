import { motion } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-media-query';

interface PlayerListItemProps {
  /**
   * Player ID
   */
  id: string;
  /**
   * Player name
   */
  name: string;
  /**
   * Player rating
   */
  rating: number;
  /**
   * Player profile photo URL
   */
  profilePhoto?: string | null;
  /**
   * Rank/position number
   */
  rank?: number;
  /**
   * Rank color class (e.g., 'text-yellow-500')
   */
  rankColor?: string;
  /**
   * Subtitle text (e.g., "5 weeks played")
   */
  subtitle?: string;
  /**
   * Delta value (rating change)
   */
  delta?: number;
  /**
   * Position badge (for waitlist)
   */
  position?: number;
  /**
   * Whether to show animation
   */
  animate?: boolean;
  /**
   * Variant style
   * - 'leaderboard': Rich design with rounded border, hover effects
   * - 'simple': Simple design with bottom border
   */
  variant?: 'leaderboard' | 'simple';
  /**
   * Avatar size
   */
  avatarSize?: 'sm' | 'md' | 'lg';
  /**
   * Whether to show rank with large styling
   */
  largeRank?: boolean;
}

export function PlayerListItem({
  id,
  name,
  rating,
  profilePhoto,
  rank,
  rankColor,
  subtitle,
  delta,
  position,
  animate = false,
  variant = 'simple',
}: PlayerListItemProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isMobile = useIsMobile();

  const content = (
    <>
      <div className={cn('flex items-center', isMobile ? 'gap-2' : 'gap-4')}>
        {/* Rank */}
        {rank !== undefined && (
          <span
            className={cn(
              'font-heading font-bold',
              !isMobile ? 'text-2xl w-10' : 'text-lg w-8',
              rankColor || 'text-muted-foreground'
            )}
          >
            #{rank}
          </span>
        )}

        {/* Position Badge (for waitlist) */}
        {position !== undefined && <Badge variant="secondary">#{position}</Badge>}

        {/* Avatar */}
        <Avatar className={cn(isMobile ? 'h-8 w-8' : 'h-10 w-10')}>
          <AvatarImage src={profilePhoto || undefined} alt={name} />
          <AvatarFallback
            className={cn('gradient-primary font-semibold', isMobile ? 'text-sm' : 'text-sm')}
          >
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>

        {/* Name and Subtitle */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{name}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Delta */}
        {delta !== undefined && (
          <div className="flex items-center gap-1 text-sm min-w-[60px] justify-end">
            {delta > 0 && (
              <>
                <ArrowUp className="h-3.5 w-3.5 text-green-600" />
                <span className="text-green-600 font-semibold">+{delta}</span>
              </>
            )}
            {delta < 0 && (
              <>
                <ArrowDown className="h-3.5 w-3.5 text-red-600" />
                <span className="text-red-600 font-semibold">{delta}</span>
              </>
            )}
            {delta === 0 && <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
          </div>
        )}

        {/* Rating */}
        <span className={cn('text-muted-foreground font-bold', !isMobile ? 'text-2xl' : 'text-md')}>
          {rating}
        </span>
      </div>
    </>
  );

  if (variant === 'leaderboard') {
    if (animate) {
      return (
        <motion.div
          key={id}
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
          }}
          className="flex items-center justify-between py-3 px-4 rounded-lg border border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all duration-300"
        >
          {content}
        </motion.div>
      );
    }

    return (
      <div
        key={id}
        className="flex items-center justify-between py-3 px-4 rounded-lg border border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all duration-300"
      >
        {content}
      </div>
    );
  }

  // Simple variant
  return (
    <div key={id} className="flex items-center justify-between py-2 border-b last:border-0">
      {content}
    </div>
  );
}
