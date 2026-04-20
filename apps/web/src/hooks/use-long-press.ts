'use client';

import { useCallback, useRef, useState } from 'react';

// Movement tolerance (px) before a long-press is cancelled. Matches the
// 10px slop most mobile UX frameworks use to distinguish "hold" from "drag".
const LONG_PRESS_MOVE_TOLERANCE_PX = 10;

interface UseLongPressOptions {
  /**
   * Duration in milliseconds to trigger long press
   * @default 500
   */
  threshold?: number;
  /**
   * Callback when long press is triggered
   */
  onLongPress: (event: React.TouchEvent | React.MouseEvent) => void;
  /**
   * Optional callback for regular click/tap
   */
  onClick?: (event: React.TouchEvent | React.MouseEvent) => void;
  /**
   * Whether to prevent default behavior
   * @default true
   */
  preventDefault?: boolean;
}

interface _LongPressState {
  /**
   * Whether long press is currently active
   */
  isLongPressing: boolean;
}

/**
 * Hook for implementing long-press gestures
 * Useful for contextual menus and alternative actions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isLongPressing, handlers } = useLongPress({
 *     onLongPress: () => console.log('Long pressed!'),
 *     onClick: () => console.log('Clicked!'),
 *   });
 *
 *   return (
 *     <div {...handlers} style={{ opacity: isLongPressing ? 0.5 : 1 }}>
 *       Press and hold me
 *     </div>
 *   );
 * }
 * ```
 */
export function useLongPress(options: UseLongPressOptions) {
  const { threshold = 500, onLongPress, onClick, preventDefault = true } = options;

  const [isLongPressing, setIsLongPressing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const start = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (preventDefault) {
        event.preventDefault();
      }

      // Store starting position
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
      startPosRef.current = { x: clientX, y: clientY };

      isLongPressRef.current = false;
      setIsLongPressing(true);

      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        onLongPress(event);
      }, threshold);
    },
    [threshold, onLongPress, preventDefault]
  );

  const clear = useCallback(
    (event: React.TouchEvent | React.MouseEvent, shouldTriggerClick = true) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      setIsLongPressing(false);

      // If it wasn't a long press and we have an onClick handler, trigger it
      if (!isLongPressRef.current && shouldTriggerClick && onClick) {
        onClick(event);
      }

      isLongPressRef.current = false;
      startPosRef.current = null;
    },
    [onClick]
  );

  const move = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (!startPosRef.current) return;

      // Get current position
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

      // Calculate distance moved
      const deltaX = Math.abs(clientX - startPosRef.current.x);
      const deltaY = Math.abs(clientY - startPosRef.current.y);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > LONG_PRESS_MOVE_TOLERANCE_PX) {
        clear(event, false);
      }
    },
    [clear]
  );

  const handlers = {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: (e: React.MouseEvent) => clear(e, false),
    onTouchStart: start,
    onTouchEnd: clear,
    onTouchMove: move,
  };

  return {
    isLongPressing,
    handlers,
  };
}
