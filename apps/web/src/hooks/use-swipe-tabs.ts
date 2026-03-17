'use client';

import { useCallback, useRef, useState } from 'react';

export interface UseSwipeTabsOptions {
  /**
   * Current active tab index
   */
  currentIndex: number;
  /**
   * Total number of tabs
   */
  tabCount: number;
  /**
   * Callback when tab changes
   */
  onTabChange: (index: number) => void;
  /**
   * Minimum swipe distance to trigger tab change (in pixels)
   * @default 50
   */
  threshold?: number;
  /**
   * Whether swiping is enabled
   * @default true
   */
  enabled?: boolean;
}

export interface UseSwipeTabsReturn {
  /**
   * Whether user is currently swiping
   */
  isSwiping: boolean;
  /**
   * Swipe progress (0 to 1)
   */
  progress: number;
  /**
   * Direction of swipe ('left' | 'right' | null)
   */
  direction: 'left' | 'right' | null;
  /**
   * Touch event handlers
   */
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
}

/**
 * Hook for swipe-between-tabs functionality
 * Enables horizontal swipe navigation between tabs
 *
 * @example
 * ```tsx
 * const { isSwiping, progress, direction, handlers } = useSwipeTabs({
 *   currentIndex: activeTabIndex,
 *   tabCount: tabs.length,
 *   onTabChange: (index) => setActiveTabIndex(index),
 * });
 *
 * <div {...handlers} style={{ transform: `translateX(${-progress * 100}%)` }}>
 *   {tabs.map((tab) => (
 *     <div key={tab.id}>{tab.content}</div>
 *   ))}
 * </div>
 * ```
 */
export function useSwipeTabs({
  currentIndex,
  tabCount,
  onTabChange,
  threshold = 50,
  enabled = true,
}: UseSwipeTabsOptions): UseSwipeTabsReturn {
  const [isSwiping, setIsSwiping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;

      touchStartX.current = e.touches[0].clientX;
      touchCurrentX.current = e.touches[0].clientX;
      setIsSwiping(true);
    },
    [enabled]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || !isSwiping) return;

      touchCurrentX.current = e.touches[0].clientX;
      const deltaX = touchCurrentX.current - touchStartX.current;
      const absDeltaX = Math.abs(deltaX);

      // Determine direction
      const swipeDirection = deltaX > 0 ? 'right' : 'left';
      setDirection(swipeDirection);

      // Calculate progress (0 to 1)
      const calculatedProgress = Math.min(absDeltaX / 200, 1);
      setProgress(calculatedProgress);
    },
    [enabled, isSwiping]
  );

  const handleTouchEnd = useCallback(() => {
    if (!enabled || !isSwiping) return;

    const deltaX = touchCurrentX.current - touchStartX.current;
    const absDeltaX = Math.abs(deltaX);

    // Determine if swipe was significant enough
    if (absDeltaX > threshold) {
      if (deltaX > 0 && currentIndex > 0) {
        // Swipe right - go to previous tab
        onTabChange(currentIndex - 1);
      } else if (deltaX < 0 && currentIndex < tabCount - 1) {
        // Swipe left - go to next tab
        onTabChange(currentIndex + 1);
      }
    }

    // Reset state
    setIsSwiping(false);
    setProgress(0);
    setDirection(null);
    touchStartX.current = 0;
    touchCurrentX.current = 0;
  }, [enabled, isSwiping, threshold, currentIndex, tabCount, onTabChange]);

  return {
    isSwiping,
    progress,
    direction,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
