'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * Hook to handle browser back-forward cache (bfcache) properly.
 * This ensures that when users navigate back using browser gestures,
 * the page is restored from cache instead of being reloaded.
 *
 * The hook listens to pageshow/pagehide events to detect when a page
 * is being restored from bfcache and can trigger any necessary updates.
 *
 * @param onRestore - Optional callback to run when page is restored from bfcache
 *
 * @example
 * ```tsx
 * function MyPage() {
 *   useBfcache(() => {
 *     // Refresh data or update UI when page is restored
 *     console.log('Page restored from cache');
 *   });
 *   return <div>Content</div>;
 * }
 * ```
 */
export function useBfcache(onRestore?: () => void) {
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      // If the page is being restored from bfcache
      if (event.persisted) {
        console.log('✅ Page restored from bfcache (no reload needed)');
        // Call the optional callback
        onRestore?.();
      }
    };

    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [onRestore]);
}

/**
 * Hook to detect if the current page load is from bfcache restoration.
 * Returns true if the page was just restored from bfcache, false otherwise.
 * The flag is automatically reset after a short delay.
 *
 * @returns boolean indicating if page was restored from bfcache
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isFromBfcache = useIsFromBfcache();
 *
 *   return (
 *     <motion.div
 *       initial={isFromBfcache ? false : "hidden"}
 *       animate="show"
 *     >
 *       Content
 *     </motion.div>
 *   );
 * }
 * ```
 */
export function useIsFromBfcache(): boolean {
  const [isFromBfcache, setIsFromBfcache] = useState(false);
  const hasChecked = useRef(false);

  useEffect(() => {
    // Only check once on mount
    if (hasChecked.current) return;
    hasChecked.current = true;

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setIsFromBfcache(true);
        // Reset after a short delay to allow animations to be skipped
        setTimeout(() => {
          setIsFromBfcache(false);
        }, 100);
      }
    };

    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  return isFromBfcache;
}
