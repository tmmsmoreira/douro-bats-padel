'use client';

import { motion } from 'motion/react';
import { ANIMATION_VARIANTS } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  /**
   * Section title
   */
  title: string;
  /**
   * Optional description
   */
  description?: string;
  /**
   * Optional action button or element
   */
  action?: React.ReactNode;
  /**
   * Alignment of the header
   * @default 'left'
   */
  align?: 'left' | 'center' | 'right';
  /**
   * Custom className
   */
  className?: string;
  /**
   * Whether to animate on mount
   * @default true
   */
  animate?: boolean;
}

/**
 * Reusable section header component for consistent section titles across the application.
 *
 * @example
 * ```tsx
 * <SectionHeader
 *   title="Upcoming Events"
 *   description="Join us for our next game night"
 *   action={<Button>View All</Button>}
 * />
 * ```
 *
 * @example
 * ```tsx
 * <SectionHeader
 *   title="About Us"
 *   align="center"
 * />
 * ```
 */
export function SectionHeader({
  title,
  description,
  action,
  align = 'left',
  className,
  animate = true,
}: SectionHeaderProps) {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const content = (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4',
        className
      )}
    >
      <div className={cn('flex-1 space-y-1', alignmentClasses[align])}>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h2>
        {description && <p className="text-sm sm:text-base text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );

  if (animate) {
    return <motion.div {...ANIMATION_VARIANTS.slideDown}>{content}</motion.div>;
  }

  return content;
}
