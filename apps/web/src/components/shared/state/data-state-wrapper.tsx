'use client';

import { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { MailboxIcon } from '@/components/icons/mailbox-icon';
import { LoadingState } from './loading-state';
import { useMinimumLoading } from '@/hooks/use-minimum-loading';
import { useIsFromBfcache } from '@/hooks';

// App-wide flag: false during SSR and the very first client paint, then flipped
// to true after the first useEffect runs anywhere. Subsequent mounts (e.g. tab
// navigations) skip the SSR hydration guard, so we don't pay the loading-flash
// cost when there's no server render to reconcile against.
let hasAppHydrated = false;

interface DataStateWrapperProps<T> {
  /**
   * The actual loading state from your data fetching
   */
  isLoading: boolean;
  /**
   * The data being loaded
   */
  data: T | undefined | null;
  /**
   * Loading message to display
   */
  loadingMessage?: string;
  /**
   * Message to display when no data is available
   */
  emptyMessage?: string;
  /**
   * Error object if there was an error
   */
  error?: Error | null;
  /**
   * Error message to display
   */
  errorMessage?: string;
  /**
   * Custom empty state component
   */
  emptyComponent?: ReactNode;
  /**
   * Custom error state component
   */
  errorComponent?: ReactNode;
  /**
   * Custom loading state component (e.g. a skeleton). Overrides the default spinner.
   */
  loadingComponent?: ReactNode;
  /**
   * Function to render the content when data is available
   */
  children: (data: T) => ReactNode;
  /**
   * Custom function to check if data is empty
   * @default (data) => !data || (Array.isArray(data) && data.length === 0)
   */
  isEmpty?: (data: T) => boolean;
  /**
   * Minimum duration in milliseconds to show loading state
   * @default 500
   */
  minLoadingDuration?: number;
  /**
   * Custom className for error state
   */
  errorClassName?: string;
}

/**
 * A reusable wrapper component that handles loading, empty, error, and content states
 * with consistent animations and minimum loading duration.
 *
 * @example
 * ```tsx
 * <DataStateWrapper
 *   isLoading={isLoading}
 *   data={players}
 *   loadingMessage={t('loadingPlayers')}
 *   emptyMessage={t('noPlayersFound')}
 * >
 *   {(players) => <PlayersList players={players} />}
 * </DataStateWrapper>
 * ```
 */
export function DataStateWrapper<T>({
  isLoading,
  data,
  loadingMessage = 'Loading...',
  emptyMessage = 'No data available',
  error,
  errorMessage = 'An error occurred',
  emptyComponent,
  errorComponent,
  loadingComponent,
  children,
  isEmpty = (data) => !data || (Array.isArray(data) && data.length === 0),
  minLoadingDuration = 500,
  errorClassName = 'text-center py-8',
}: DataStateWrapperProps<T>) {
  const isBackNav = useIsFromBfcache();

  // Use minimum loading to prevent jarring flashes
  // Consider loading complete if we have data OR an error
  const hasDataOrError = !!data || !!error;
  const showLoading = useMinimumLoading(isLoading, hasDataOrError, minLoadingDuration);

  // The server can't know whether the client has a warm TanStack Query / bfcache,
  // so `isLoading` (and thus showLoading) can differ between SSR and first client
  // paint. Force the first paint into the loading state on both sides so the
  // hydrated DOM matches — but only for the *first* mount in the app session.
  // Subsequent mounts (tab navigation, opening modals, etc.) are pure client
  // renders with no SSR to reconcile against, so they skip the guard and avoid
  // the AnimatePresence loading→content flash.
  const [needsHydrationGuard, setNeedsHydrationGuard] = useState(!hasAppHydrated);
  useEffect(() => {
    hasAppHydrated = true;
    setNeedsHydrationGuard(false);
  }, []);
  const effectiveShowLoading = needsHydrationGuard || showLoading;

  return (
    <div aria-live="polite" aria-busy={effectiveShowLoading}>
      <AnimatePresence mode="wait">
        {effectiveShowLoading ? (
          loadingComponent ? (
            <motion.div
              key="loading"
              initial={isBackNav ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: isBackNav ? 0 : 0.2 }}
              role="status"
              aria-live="polite"
            >
              {loadingComponent}
            </motion.div>
          ) : (
            <LoadingState message={loadingMessage} />
          )
        ) : error ? (
          errorComponent ? (
            <motion.div
              key="error"
              initial={isBackNav ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: isBackNav ? 0 : 0.3 }}
              role="alert"
            >
              {errorComponent}
            </motion.div>
          ) : (
            <motion.div
              key="error"
              initial={isBackNav ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: isBackNav ? 0 : 0.3 }}
              className={errorClassName}
              role="alert"
            >
              {errorMessage}
            </motion.div>
          )
        ) : isEmpty(data as T) ? (
          emptyComponent ? (
            <motion.div
              key="empty"
              initial={isBackNav ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: isBackNav ? 0 : 0.3 }}
            >
              {emptyComponent}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={isBackNav ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: isBackNav ? 0 : 0.3 }}
              role="status"
            >
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MailboxIcon />
                  </EmptyMedia>
                  <EmptyTitle>{emptyMessage}</EmptyTitle>
                </EmptyHeader>
              </Empty>
            </motion.div>
          )
        ) : (
          <motion.div
            key="content"
            initial={isBackNav ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: isBackNav ? 0 : 0.3 }}
          >
            {children(data as T)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
