'use client';

import { useEffect, useState } from 'react';

// Module-level back-navigation detection.
// - `popstate` fires on back/forward → sets flag to true
// - `pushState` fires on forward navigation (link click, router.push) → resets to false
// No timeout needed: the flag stays true until the next forward navigation.
let _isBackNavigation = false;

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    _isBackNavigation = true;
  });

  // Reset when a forward navigation happens (router.push / Link click)
  const _origPushState = history.pushState;
  history.pushState = function (...args) {
    _isBackNavigation = false;
    return _origPushState.apply(this, args);
  };
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
