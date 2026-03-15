'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useHaptic } from './use-haptic';

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
  const haptic = useHaptic();
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const scrollY = useRef(0);
  const hasTriggeredThresholdHaptic = useRef(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Haptic feedback when refresh starts
    haptic.medium();

    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        // Default: refresh the current page
        router.refresh();
        // Add a small delay to show the refresh animation
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      // Success haptic when refresh completes
      haptic.success();
    } catch (error) {
      // Error haptic if refresh fails
      haptic.error();
      throw error;
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
      setIsPulling(false);
      hasTriggeredThresholdHaptic.current = false;
    }
  }, [onRefresh, router, haptic]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only start if we're at the top of the page
      scrollY.current = window.scrollY;
      if (scrollY.current === 0) {
        touchStartY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
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

        // Trigger haptic feedback when threshold is reached (only once)
        if (adjustedDistance >= threshold && !hasTriggeredThresholdHaptic.current) {
          haptic.light();
          hasTriggeredThresholdHaptic.current = true;
        }
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
          hasTriggeredThresholdHaptic.current = false;
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
