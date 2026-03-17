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
 * Hook to detect if the current page load is from bfcache restoration OR
 * from client-side navigation (Next.js router).
 *
 * This hook detects two scenarios:
 * 1. BFCache restoration (browser back/forward with full page cache)
 * 2. Client-side navigation back (Next.js router, component remount)
 *
 * Returns true if the page was just restored/navigated back to, false otherwise.
 * The flag is automatically reset after a short delay.
 *
 * @returns boolean indicating if page was restored from cache or navigated back to
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountTimeRef = useRef<number>(0);

  useEffect(() => {
    const currentTime = Date.now();
    const timeSinceLastMount = currentTime - mountTimeRef.current;

    console.log('📡 Component mounted:', {
      timeSinceLastMount,
      isQuickRemount: timeSinceLastMount < 1000,
    });

    // If component was unmounted and remounted within 1 second,
    // it's likely a back navigation (client-side routing)
    if (mountTimeRef.current > 0 && timeSinceLastMount < 1000) {
      console.log('✅ Quick remount detected - treating as back navigation');
      setIsFromBfcache(true);

      // Reset after a short delay
      timeoutRef.current = setTimeout(() => {
        console.log('🔄 Resetting back navigation flag');
        setIsFromBfcache(false);
      }, 150);
    }

    const handlePageShow = (event: PageTransitionEvent) => {
      console.log('🔍 pageshow event:', { persisted: event.persisted, timestamp: Date.now() });

      if (event.persisted) {
        console.log('✅ BFCache restoration detected - setting isFromBfcache to TRUE');
        setIsFromBfcache(true);

        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Reset after a short delay to allow animations to be skipped
        timeoutRef.current = setTimeout(() => {
          console.log('🔄 Resetting BFCache flag to FALSE');
          setIsFromBfcache(false);
        }, 150);
      }
    };

    // Add pageshow listener for actual BFCache
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      // Store unmount time for next mount
      mountTimeRef.current = Date.now();
      console.log('🗑️ Component unmounted at:', mountTimeRef.current);

      window.removeEventListener('pageshow', handlePageShow);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return isFromBfcache;
}
