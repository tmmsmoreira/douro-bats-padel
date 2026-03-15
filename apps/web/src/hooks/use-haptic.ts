'use client';

import { useCallback } from 'react';

/**
 * Haptic feedback patterns for different interaction types
 */
export type HapticPattern =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection';

/**
 * Hook for providing haptic feedback on mobile devices
 *
 * Uses the Vibration API to provide tactile feedback for user interactions.
 * Automatically checks for browser support and gracefully degrades if not available.
 *
 * @example
 * ```tsx
 * function MyButton() {
 *   const haptic = useHaptic();
 *
 *   return (
 *     <button onClick={() => {
 *       haptic.light();
 *       // ... handle click
 *     }}>
 *       Click me
 *     </button>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * function SuccessMessage() {
 *   const haptic = useHaptic();
 *
 *   useEffect(() => {
 *     haptic.success();
 *   }, []);
 *
 *   return <div>Success!</div>;
 * }
 * ```
 */
export function useHaptic() {
  /**
   * Trigger vibration with the given pattern
   * @param pattern - Single number (duration in ms) or array of durations
   */
  const vibrate = useCallback((pattern: number | number[]) => {
    // Check if vibration API is supported
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        // Silently fail if vibration is not supported or blocked
        console.debug('Haptic feedback not available:', error);
      }
    }
  }, []);

  /**
   * Light haptic feedback - for subtle interactions
   * Use for: hover states, focus changes, minor UI updates
   */
  const light = useCallback(() => {
    vibrate(10);
  }, [vibrate]);

  /**
   * Medium haptic feedback - for standard interactions
   * Use for: button presses, toggle switches, selections
   */
  const medium = useCallback(() => {
    vibrate(20);
  }, [vibrate]);

  /**
   * Heavy haptic feedback - for important interactions
   * Use for: confirmations, deletions, important actions
   */
  const heavy = useCallback(() => {
    vibrate(30);
  }, [vibrate]);

  /**
   * Success haptic feedback - double tap pattern
   * Use for: successful operations, confirmations, completions
   */
  const success = useCallback(() => {
    vibrate([10, 50, 10]);
  }, [vibrate]);

  /**
   * Warning haptic feedback - triple tap pattern
   * Use for: warnings, cautions, important notices
   */
  const warning = useCallback(() => {
    vibrate([15, 30, 15, 30, 15]);
  }, [vibrate]);

  /**
   * Error haptic feedback - strong double tap
   * Use for: errors, failures, invalid actions
   */
  const error = useCallback(() => {
    vibrate([20, 100, 20]);
  }, [vibrate]);

  /**
   * Selection haptic feedback - very light tap
   * Use for: list item selections, radio buttons, checkboxes
   */
  const selection = useCallback(() => {
    vibrate(5);
  }, [vibrate]);

  /**
   * Custom haptic feedback with specific pattern
   * @param pattern - Custom vibration pattern
   */
  const custom = useCallback(
    (pattern: number | number[]) => {
      vibrate(pattern);
    },
    [vibrate]
  );

  /**
   * Trigger haptic feedback by pattern name
   * @param pattern - Named haptic pattern
   */
  const trigger = useCallback(
    (pattern: HapticPattern) => {
      switch (pattern) {
        case 'light':
          light();
          break;
        case 'medium':
          medium();
          break;
        case 'heavy':
          heavy();
          break;
        case 'success':
          success();
          break;
        case 'warning':
          warning();
          break;
        case 'error':
          error();
          break;
        case 'selection':
          selection();
          break;
      }
    },
    [light, medium, heavy, success, warning, error, selection]
  );

  return {
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selection,
    custom,
    trigger,
  };
}
