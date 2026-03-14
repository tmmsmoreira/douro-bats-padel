'use client';

import { motion } from 'motion/react';
import { Spinner } from '@/components/ui/spinner';

interface LoadingStateProps {
  /**
   * The loading message to display
   */
  message?: string;
  /**
   * Whether to show the spinner icon
   * @default true
   */
  showSpinner?: boolean;
  /**
   * Custom className for the container
   */
  className?: string;
  /**
   * Whether to animate the loading state on mount
   * @default true
   */
  animate?: boolean;
}

/**
 * A reusable loading state component with consistent styling and animation.
 *
 * @example
 * ```tsx
 * <LoadingState message="Loading events..." />
 * <LoadingState message="Loading..." showSpinner={false} />
 * <LoadingState message="Please wait..." className="py-12" />
 * ```
 */
export function LoadingState({
  message = 'Loading...',
  showSpinner = true,
  className = 'flex items-center justify-center py-8',
  animate = true,
}: LoadingStateProps) {
  const content = (
    <div className={className} role="status" aria-live="polite">
      {showSpinner && <Spinner data-icon="inline-start" className="mr-2" />}
      <span>{message}</span>
    </div>
  );

  if (animate) {
    return (
      <motion.div
        key="loading"
        initial={{ opacity: 0, scale: 0.95 }}
        exit={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
