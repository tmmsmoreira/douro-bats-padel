'use client';

import { useEffect, useState } from 'react';

// Module-level back-navigation detection.
// `popstate` fires BEFORE the new route's components mount,
// so the flag is ready for them to read during their initial render.
let _isBackNavigation = false;
let _resetTimer: ReturnType<typeof setTimeout> | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    _isBackNavigation = true;
    // Clear any pending reset so rapid back/forward navigations work correctly
    if (_resetTimer) clearTimeout(_resetTimer);
    // Reset after components have had time to mount and read the flag
    _resetTimer = setTimeout(() => {
      _isBackNavigation = false;
    }, 500);
  });
}

/**
 * Hook to handle browser back-forward cache (bfcache) properly.
 *
 * @param onRestore - Optional callback to run when page is restored from bfcache
 */
export function useBfcache(onRestore?: () => void) {
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        onRestore?.();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [onRestore]);
}

/**
 * Returns true if the component mounted due to a back/forward navigation
 * (popstate) or was restored from bfcache.
 *
 * Use this to skip entrance animations on back navigation.
 */
export function useIsFromBfcache(): boolean {
  // Capture the module-level flag at mount time.
  // useState initializer runs once, during the first render.
  const [wasBackNav] = useState(() => _isBackNavigation);
  return wasBackNav;
}
