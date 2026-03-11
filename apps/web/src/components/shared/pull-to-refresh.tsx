'use client';

import { motion, AnimatePresence } from 'motion/react';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  /**
   * Minimum distance in pixels to trigger refresh
   * @default 80
   */
  threshold?: number;
  /**
   * Maximum pull distance in pixels
   * @default 150
   */
  maxPullDistance?: number;
  /**
   * Custom refresh handler. If not provided, will refresh the current page
   */
  onRefresh?: () => Promise<void> | void;
  /**
   * Whether pull-to-refresh is enabled
   * @default true
   */
  enabled?: boolean;
}

/**
 * Pull-to-refresh component for PWA
 * Displays a visual indicator when user pulls down to refresh
 *
 * @example
 * ```tsx
 * <PullToRefresh />
 * ```
 */
export function PullToRefresh({
  threshold = 80,
  maxPullDistance = 150,
  onRefresh,
  enabled = true,
}: PullToRefreshProps) {
  const { isPulling, pullDistance, isRefreshing } = usePullToRefresh({
    threshold,
    maxPullDistance,
    onRefresh,
    enabled,
  });

  // Calculate progress percentage
  const progress = Math.min((pullDistance / threshold) * 100, 100);
  const shouldTrigger = pullDistance >= threshold;

  return (
    <AnimatePresence>
      {(isPulling || isRefreshing) && (
        <motion.div
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 left-0 right-0 z-40 flex items-center justify-center pointer-events-none"
          style={{
            transform: `translateY(${Math.min(pullDistance, maxPullDistance)}px)`,
          }}
        >
          <div className="bg-background/95 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
            {/* Refresh Icon */}
            <motion.div
              animate={{
                rotate: isRefreshing ? 360 : shouldTrigger ? 180 : 0,
              }}
              transition={{
                duration: isRefreshing ? 1 : 0.3,
                repeat: isRefreshing ? Infinity : 0,
                ease: isRefreshing ? 'linear' : 'easeOut',
              }}
            >
              <RefreshCw
                className={`w-5 h-5 ${
                  shouldTrigger || isRefreshing ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
            </motion.div>

            {/* Progress Text */}
            <span
              className={`text-sm font-medium ${
                shouldTrigger || isRefreshing ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {isRefreshing
                ? 'Refreshing...'
                : shouldTrigger
                  ? 'Release to refresh'
                  : 'Pull to refresh'}
            </span>

            {/* Progress Bar */}
            {!isRefreshing && (
              <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
