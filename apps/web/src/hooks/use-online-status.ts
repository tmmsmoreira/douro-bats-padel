'use client';

import { useState, useEffect } from 'react';
import { TIMINGS } from '@/lib/constants';

/**
 * Custom hook to detect online/offline status.
 * Listens to browser online/offline events and provides current status.
 *
 * @returns Object containing online status and last change timestamp
 *
 * @example
 * ```tsx
 * const { isOnline, wasOffline } = useOnlineStatus();
 *
 * if (!isOnline) {
 *   return <OfflineMessage />;
 * }
 * ```
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    let timeoutId: NodeJS.Timeout | null = null;

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      timeoutId = setTimeout(() => setWasOffline(false), TIMINGS.ONLINE_TOAST_MS);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      // Clear timeout on cleanup to prevent memory leaks and allow bfcache
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return { isOnline, wasOffline };
}
