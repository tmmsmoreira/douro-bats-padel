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
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && hasData) {
      // Data has loaded, start the minimum duration timer
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, minDuration);

      return () => clearTimeout(timer);
    } else {
      // Still loading or no data, keep showing loading state
      setShowLoading(true);
    }
  }, [isLoading, hasData, minDuration]);

  return isLoading || showLoading;
}
