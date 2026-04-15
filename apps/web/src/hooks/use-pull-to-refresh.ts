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
  isDone: boolean;
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
  const [isDone, setIsDone] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const scrollY = useRef(0);
  const isHorizontalSwipe = useRef(false);

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
      setIsDone(true);
      // Show done state briefly, then hide
      setTimeout(() => {
        setIsDone(false);
        setPullDistance(0);
        setIsPulling(false);
      }, 800);
    }
  }, [onRefresh, router, queryClient]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleTouchStart = (e: TouchEvent) => {
      // Don't start if overscroll is disabled (e.g., when mobile menu is open)
      if (document.body.style.overscrollBehavior === 'none') return;

      // Don't start if a drawer or dialog is open
      const hasOpenDrawer = document.querySelector(
        '[data-slot="drawer-overlay"][data-state="open"]'
      );
      const hasOpenDialog = document.querySelector(
        '[data-slot="dialog-overlay"][data-state="open"]'
      );
      if (hasOpenDrawer || hasOpenDialog) return;

      // Only start if we're at the top of the page
      scrollY.current = window.scrollY;
      isHorizontalSwipe.current = false;
      if (scrollY.current === 0) {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Don't pull if overscroll is disabled (e.g., when mobile menu is open)
      if (document.body.style.overscrollBehavior === 'none') return;

      // Don't pull if a drawer or dialog is open
      const hasOpenDrawer = document.querySelector(
        '[data-slot="drawer-overlay"][data-state="open"]'
      );
      const hasOpenDialog = document.querySelector(
        '[data-slot="dialog-overlay"][data-state="open"]'
      );
      if (hasOpenDrawer || hasOpenDialog) return;

      // Only pull if we're at the top of the page
      if (scrollY.current !== 0 || isRefreshing) return;

      // Once locked as horizontal, ignore for the rest of this gesture
      if (isHorizontalSwipe.current) return;

      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const deltaX = Math.abs(touchX - touchStartX.current);
      const deltaY = touchY - touchStartY.current;
      const totalMovement = Math.max(deltaX, Math.abs(deltaY));

      // Wait for enough movement to determine gesture direction
      if (totalMovement < 10) return;

      // Lock out pull-to-refresh if the gesture is primarily horizontal
      if (deltaX > Math.abs(deltaY)) {
        isHorizontalSwipe.current = true;
        return;
      }

      // Only pull down (positive vertical distance)
      if (deltaY > 0) {
        e.preventDefault();
        setIsPulling(true);
        // Apply resistance effect (diminishing returns)
        const resistanceFactor = 0.5;
        const adjustedDistance = Math.min(deltaY * resistanceFactor, maxPullDistance);
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
    isDone,
  };
}
