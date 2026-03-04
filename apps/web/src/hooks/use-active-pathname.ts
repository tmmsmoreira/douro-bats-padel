'use client';

import { useState, useLayoutEffect } from 'react';
import { usePathname } from '@/i18n/navigation';

/**
 * Custom hook that returns the current pathname without locale prefix.
 *
 * This hook ensures the pathname is read synchronously from window.location
 * on initial mount to avoid stale data from usePathname() during navigation.
 * This prevents flickering when highlighting active navigation links.
 *
 * @returns The current pathname without the locale prefix (e.g., '/admin' instead of '/en/admin')
 */
export function useActivePathname(): string {
  const pathnameFromHook = usePathname();

  // Get pathname synchronously from window.location to avoid stale data on mount
  // This ensures the active link is highlighted immediately without flicker
  const getPathnameWithoutLocale = () => {
    if (typeof window === 'undefined') return pathnameFromHook;
    const path = window.location.pathname;
    const segments = path.split('/');
    // Remove locale prefix (e.g., '/en/admin' -> '/admin')
    return segments.length > 2 ? '/' + segments.slice(2).join('/') : '/';
  };

  const [pathname, setPathname] = useState(getPathnameWithoutLocale);

  // Sync pathname with hook value when it changes using layoutEffect
  // This runs synchronously before browser paint to avoid flicker
  useLayoutEffect(() => {
    setPathname(pathnameFromHook);
  }, [pathnameFromHook]);

  return pathname;
}
