'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook that ensures a loading state is visible for a minimum duration.
 * Prevents jarring flashes when data loads too quickly, and holds the loading
 * state until the query has actually produced a result — `isLoading` alone can
 * flip to false a tick before data arrives (bfcache restore, cache hit,
 * stale-while-revalidate), which would briefly expose empty/error UI.
 *
 * @param isLoading - Actual loading flag from your data fetching
 * @param hasData - Whether the query has settled (data or error). Defaults to
 *   `!isLoading`, which reproduces the caller-less behavior: the hook only
 *   waits on `isLoading`. Pass `!!data || !!error` to wait for the real
 *   resolution.
 * @param minDuration - Minimum ms to show loading state (default: 500)
 *
 * @example
 * ```tsx
 * const { data, isLoading, isError } = useQuery(...);
 * const showLoading = useMinimumLoading(isLoading, !!data || isError);
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
      setLoadingStartTime(Date.now());
      setShowLoading(true);
    } else if (!isLoading && hasData && loadingStartTime !== null) {
      const elapsed = Date.now() - loadingStartTime;
      const remaining = Math.max(0, minDuration - elapsed);

      const timer = setTimeout(() => {
        setShowLoading(false);
        setLoadingStartTime(null);
      }, remaining);

      return () => clearTimeout(timer);
    }
  }, [isLoading, hasData, loadingStartTime, minDuration]);

  return showLoading;
}
