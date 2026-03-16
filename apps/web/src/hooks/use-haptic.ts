'use client';

import { useCallback, useEffect, useRef } from 'react';

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
 * Platform Support:
 * - iOS PWA: Uses AudioContext for subtle click sounds (iOS doesn't support Vibration API)
 * - Android PWA: Uses Vibration API for haptic feedback
 * - Desktop: No haptic feedback (gracefully degrades)
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
 */
export function useHaptic() {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize AudioContext for iOS (since Vibration API is not supported)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if we're on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    // Only create AudioContext on iOS where Vibration API is not supported
    if (isIOS && !('vibrate' in navigator)) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.debug('AudioContext not available:', error);
      }
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  /**
   * Trigger haptic feedback
   * - Android: Uses Vibration API
   * - iOS: Uses AudioContext to play a subtle click sound
   */
  const triggerHaptic = useCallback((duration: number, frequency: number = 1000) => {
    if (typeof window === 'undefined') return;

    try {
      // Try Vibration API first (works on Android)
      if ('vibrate' in navigator) {
        const result = navigator.vibrate(duration);
        if (result) return; // Success on Android
      }

      // Fallback to AudioContext for iOS
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Very short, subtle click sound
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        // Quick fade in/out for a "tap" sound
        const now = ctx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.001);
        gainNode.gain.linearRampToValueAtTime(0, now + duration / 1000);

        oscillator.start(now);
        oscillator.stop(now + duration / 1000);
      }
    } catch (error) {
      console.debug('Haptic feedback error:', error);
    }
  }, []);

  /**
   * Light haptic feedback - for subtle interactions
   * Use for: hover states, focus changes, minor UI updates
   */
  const light = useCallback(() => {
    triggerHaptic(10, 800); // 10ms, 800Hz - very subtle
  }, [triggerHaptic]);

  /**
   * Medium haptic feedback - for standard interactions
   * Use for: button presses, toggle switches, selections
   */
  const medium = useCallback(() => {
    triggerHaptic(15, 1000); // 15ms, 1000Hz - standard tap
  }, [triggerHaptic]);

  /**
   * Heavy haptic feedback - for important interactions
   * Use for: confirmations, deletions, important actions
   */
  const heavy = useCallback(() => {
    triggerHaptic(25, 1200); // 25ms, 1200Hz - stronger tap
  }, [triggerHaptic]);

  /**
   * Success haptic feedback - double tap pattern
   * Use for: successful operations, confirmations, completions
   */
  const success = useCallback(() => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }
  }, []);

  /**
   * Warning haptic feedback - triple tap pattern
   * Use for: warnings, cautions, important notices
   */
  const warning = useCallback(() => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([15, 30, 15, 30, 15]);
    }
  }, []);

  /**
   * Error haptic feedback - strong double tap
   * Use for: errors, failures, invalid actions
   */
  const error = useCallback(() => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([20, 100, 20]);
    }
  }, []);

  /**
   * Selection haptic feedback - very light tap
   * Use for: list item selections, radio buttons, checkboxes
   */
  const selection = useCallback(() => {
    triggerHaptic(8, 900); // 8ms, 900Hz - very light tap
  }, [triggerHaptic]);

  /**
   * Custom haptic feedback with specific pattern
   * @param pattern - Custom vibration pattern
   */
  const custom = useCallback((pattern: number | number[]) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

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
