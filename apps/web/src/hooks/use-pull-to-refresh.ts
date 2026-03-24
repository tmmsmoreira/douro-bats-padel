'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

interface UsePullToRefreshOptions {
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

interface PullToRefreshState {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
}

/**
 * Hook for implementing pull-to-refresh functionality in PWA
 *
 * @example
 * ```tsx
 * function MyPage() {
 *   const { pullDistance, isPulling, isRefreshing } = usePullToRefresh();
 *
 *   return (
 *     <div>
 *       {isPulling && <div>Pull to refresh...</div>}
 *       {isRefreshing && <div>Refreshing...</div>}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePullToRefresh(options: UsePullToRefreshOptions = {}): PullToRefreshState {
  const { threshold = 80, maxPullDistance = 150, onRefresh, enabled = true } = options;

  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const scrollY = useRef(0);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        // Default: invalidate all queries and refresh the current page
        await queryClient.invalidateQueries();
        router.refresh();
        // Add a small delay to show the refresh animation
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      // Log error but don't throw to prevent breaking the UI
      console.error('Pull to refresh error:', error);
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
      setIsPulling(false);
    }
  }, [onRefresh, router, queryClient]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleTouchStart = (e: TouchEvent) => {
      // Don't start if overscroll is disabled (e.g., when mobile menu is open)
      if (document.body.style.overscrollBehavior === 'none') return;

      // Only start if we're at the top of the page
      scrollY.current = window.scrollY;
      if (scrollY.current === 0) {
        touchStartY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Don't pull if overscroll is disabled (e.g., when mobile menu is open)
      if (document.body.style.overscrollBehavior === 'none') return;

      // Only pull if we're at the top of the page
      if (scrollY.current !== 0 || isRefreshing) return;

      const touchY = e.touches[0].clientY;
      const distance = touchY - touchStartY.current;

      // Only pull down (positive distance)
      if (distance > 0) {
        // Prevent default browser pull-to-refresh
        if (distance > 10) {
          e.preventDefault();
        }

        setIsPulling(true);
        // Apply resistance effect (diminishing returns)
        const resistanceFactor = 0.5;
        const adjustedDistance = Math.min(distance * resistanceFactor, maxPullDistance);
        setPullDistance(adjustedDistance);
      }
    };

    const handleTouchEnd = () => {
      if (isPulling) {
        if (pullDistance >= threshold) {
          handleRefresh();
        } else {
          // Reset if threshold not met
          setIsPulling(false);
          setPullDistance(0);
        }
      }
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, isPulling, pullDistance, threshold, maxPullDistance, isRefreshing, handleRefresh]);

  return {
    isPulling,
    pullDistance,
    isRefreshing,
  };
}
