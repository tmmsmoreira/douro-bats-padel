'use client';

import { useEffect, useState } from 'react';

export const SPLASH_OFFSET_SECONDS = 0.3;

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function useIsStandalone(): boolean {
  const [isStandalone, setIsStandalone] = useState<boolean>(detectStandalone);

  useEffect(() => {
    const mql = window.matchMedia('(display-mode: standalone)');
    const update = () => setIsStandalone(detectStandalone());
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  return isStandalone;
}

/**
 * Extra delay (in seconds) to apply to entrance animations so they don't play
 * behind the PWA splash screen. Returns 0 in a regular browser, where no
 * splash is shown.
 */
export function useSplashOffset(): number {
  return useIsStandalone() ? SPLASH_OFFSET_SECONDS : 0;
}
