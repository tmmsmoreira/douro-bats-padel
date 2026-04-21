'use client';

import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { ANIMATION_VARIANTS } from '@/lib/animations';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  /**
   * Message to display
   */
  message: string;
  /**
   * Optional icon to display above the message
   */
  icon?: LucideIcon;
  /**
   * Optional description text below the message
   */
  description?: string;
  /**
   * Optional action button or element
   */
  action?: React.ReactNode;
  /**
   * Custom className for the card
   */
  className?: string;
  /**
   * Whether to animate on mount
   * @default true
   */
  animate?: boolean;
}

/**
 * Reusable empty state component with consistent styling and animation.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   message="No events found"
 *   description="There are no upcoming events at the moment"
 *   icon={Calendar}
 *   action={<Button>Create Event</Button>}
 * />
 * ```
 *
 * @example
 * ```tsx
 * <EmptyState message="No players found" />
 * ```
 */
export function EmptyState({
  message,
  icon: Icon,
  description,
  action,
  className,
  animate = true,
}: EmptyStateProps) {
  const content = (
    <Card
      className={cn(
        'glass-card group transition-shadow duration-200 ease-out border-border/50',
        className
      )}
    >
      <CardContent className="py-12 text-center">
        <div className="flex flex-col items-center gap-4">
          {Icon && (
            <div className="p-3 bg-muted rounded-full">
              <Icon className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          <div className="space-y-2">
            <p className="text-lg font-medium text-muted-foreground">{message}</p>
            {description && <p className="text-sm text-muted-foreground/70">{description}</p>}
          </div>
          {action && <div className="mt-2">{action}</div>}
        </div>
      </CardContent>
    </Card>
  );

  if (animate) {
    return <motion.div {...ANIMATION_VARIANTS.fadeInScale}>{content}</motion.div>;
  }

  return content;
}
