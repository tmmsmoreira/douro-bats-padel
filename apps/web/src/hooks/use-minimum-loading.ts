'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook that ensures a loading state is visible for a minimum duration.
 * This prevents jarring flashes when data loads too quickly.
 *
 * @param isLoading - The actual loading state from your data fetching
 * @param hasData - Whether the data has been loaded (optional, defaults to true when not loading)
 * @param minDuration - Minimum duration in milliseconds to show loading state (default: 500ms)
 * @returns boolean - Whether to show the loading state
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useQuery(...);
 * const showLoading = useMinimumLoading(isLoading, !!data);
 *
 * if (showLoading) {
 *   return <LoadingState />;
 * }
 * ```
 */
export function useMinimumLoading(
  isLoading: boolean,
  hasData: boolean = !isLoading,
  minDuration: number = 500
): boolean {
  const [showLoading, setShowLoading] = useState(isLoading);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading && loadingStartTime === null) {
      // Started loading, record the start time
      setLoadingStartTime(Date.now());
      setShowLoading(true);
    } else if (!isLoading && loadingStartTime !== null) {
      // Loading finished, enforce minimum duration
      const elapsed = Date.now() - loadingStartTime;
      const remaining = Math.max(0, minDuration - elapsed);

      const timer = setTimeout(() => {
        setShowLoading(false);
        setLoadingStartTime(null);
      }, remaining);

      return () => clearTimeout(timer);
    }
  }, [isLoading, loadingStartTime, minDuration]);

  return showLoading;
}
