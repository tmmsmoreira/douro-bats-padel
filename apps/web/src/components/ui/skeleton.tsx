import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to show the shimmer animation
   * @default true
   */
  animate?: boolean;
}

/**
 * Base Skeleton component for loading states
 *
 * @example
 * ```tsx
 * <Skeleton className="h-4 w-full" />
 * ```
 */
function Skeleton({ className, animate = true, ...props }: SkeletonProps) {
  return (
    <div className={cn('rounded-md bg-muted', animate && 'animate-pulse', className)} {...props} />
  );
}

/**
 * Skeleton for text lines
 */
function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-4/5' : 'w-full' // Last line is shorter
          )}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton for avatar/profile picture
 */
function SkeletonAvatar({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return <Skeleton className={cn('rounded-full', sizeClasses[size], className)} />;
}

/**
 * Skeleton for a card component
 */
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('card-native p-6 space-y-4', className)}>
      <div className="flex items-center gap-4">
        <SkeletonAvatar />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

/**
 * Skeleton for a list item
 */
function SkeletonListItem({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-4 p-4', className)}>
      <SkeletonAvatar size="sm" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

/**
 * Skeleton for a button
 */
function SkeletonButton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-10 w-24 rounded-lg', className)} />;
}

/**
 * Skeleton for an image
 */
function SkeletonImage({
  aspectRatio = 'video',
  className,
}: {
  aspectRatio?: 'square' | 'video' | 'portrait';
  className?: string;
}) {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
  };

  return <Skeleton className={cn('w-full', aspectClasses[aspectRatio], className)} />;
}

/**
 * Skeleton for a table row
 */
function SkeletonTableRow({ columns = 4, className }: { columns?: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-4 p-4 border-b', className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}

/**
 * Skeleton for a game night card (specific to this app)
 */
function SkeletonGameNightCard({ className }: { className?: string }) {
  return (
    <div className={cn('card-native p-6 space-y-4', className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>

      {/* Details */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <SkeletonButton className="flex-1" />
        <SkeletonButton className="flex-1" />
      </div>
    </div>
  );
}

/**
 * Skeleton for a player card (specific to this app)
 */
function SkeletonPlayerCard({ className }: { className?: string }) {
  return (
    <div className={cn('card-native p-4 space-y-3', className)}>
      <div className="flex items-center gap-3">
        <SkeletonAvatar size="md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t">
        <div className="text-center space-y-1">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-3 w-full" />
        </div>
        <div className="text-center space-y-1">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-3 w-full" />
        </div>
        <div className="text-center space-y-1">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </div>
  );
}

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonListItem,
  SkeletonButton,
  SkeletonImage,
  SkeletonTableRow,
  SkeletonGameNightCard,
  SkeletonPlayerCard,
};
