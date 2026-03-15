'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHaptic } from './use-haptic';

interface UseSwipeBackOptions {
  /**
   * Whether swipe-to-go-back is enabled
   * @default true
   */
  enabled?: boolean;
  /**
   * Minimum distance in pixels from left edge to start swipe
   * @default 20
   */
  edgeThreshold?: number;
  /**
   * Minimum swipe distance to trigger navigation
   * @default 100
   */
  swipeThreshold?: number;
  /**
   * Custom back handler. If not provided, will use router.back()
   */
  onBack?: () => void;
}

interface SwipeBackState {
  /**
   * Whether user is currently swiping
   */
  isSwiping: boolean;
  /**
   * Current swipe progress (0-1)
   */
  progress: number;
}

/**
 * Hook for implementing iOS-style swipe-from-left-edge to go back
 *
 * @example
 * ```tsx
 * function MyPage() {
 *   const { isSwiping, progress } = useSwipeBack();
 *
 *   return (
 *     <div style={{ opacity: isSwiping ? 1 - progress * 0.3 : 1 }}>
 *       Content
 *     </div>
 *   );
 * }
 * ```
 */
export function useSwipeBack(options: UseSwipeBackOptions = {}): SwipeBackState {
  const { enabled = true, edgeThreshold = 20, swipeThreshold = 100, onBack } = options;

  const router = useRouter();
  const haptic = useHaptic();
  const [isSwiping, setIsSwiping] = useState(false);
  const [progress, setProgress] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isEdgeSwipe = useRef(false);
  const hasTriggeredHaptic = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;

      // Check if touch started near left edge
      if (touch.clientX <= edgeThreshold) {
        isEdgeSwipe.current = true;
        hasTriggeredHaptic.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isEdgeSwipe.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = touch.clientY - touchStartY.current;

      // Only consider horizontal swipes (more horizontal than vertical)
      if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0) {
        // Prevent default to avoid conflicts with other gestures
        if (deltaX > 10) {
          e.preventDefault();
        }

        setIsSwiping(true);
        const swipeProgress = Math.min(deltaX / swipeThreshold, 1);
        setProgress(swipeProgress);

        // Trigger haptic when threshold is reached
        if (swipeProgress >= 1 && !hasTriggeredHaptic.current) {
          haptic.light();
          hasTriggeredHaptic.current = true;
        }
      } else if (Math.abs(deltaY) > Math.abs(deltaX)) {
        // If user is scrolling vertically, cancel the edge swipe
        isEdgeSwipe.current = false;
        setIsSwiping(false);
        setProgress(0);
      }
    };

    const handleTouchEnd = () => {
      if (isSwiping && progress >= 1) {
        // Trigger navigation
        haptic.medium();
        if (onBack) {
          onBack();
        } else {
          router.back();
        }
      }

      // Reset state
      isEdgeSwipe.current = false;
      setIsSwiping(false);
      setProgress(0);
      hasTriggeredHaptic.current = false;
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [enabled, edgeThreshold, swipeThreshold, isSwiping, progress, onBack, router, haptic]);

  return {
    isSwiping,
    progress,
  };
}
