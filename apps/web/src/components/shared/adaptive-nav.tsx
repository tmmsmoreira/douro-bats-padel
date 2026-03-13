'use client';

import { useState, useLayoutEffect, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from '@/i18n/navigation';
import { AdminNav } from '@/components/admin/admin-nav';
import { PlayerNav } from '@/components/player/player-nav';

/**
 * Adaptive navigation component that shows Admin or Player nav based on:
 * 1. Current URL pathname (primary - if on /admin, show AdminNav)
 * 2. User's previous navigation context (stored in sessionStorage)
 * 3. User's role (fallback to Player nav if not an editor)
 *
 * This component animates ONLY when switching between Admin and Player views,
 * not when navigating between pages within the same view.
 */
export function AdaptiveNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  // Check if we're on an admin route
  const isOnAdminRoute = pathname.startsWith('/admin');

  // Initialize state by checking URL first, then sessionStorage
  const [showAdminNav, setShowAdminNav] = useState(() => {
    if (typeof window === 'undefined') return false;

    // Check URL first
    const path = window.location.pathname;
    const segments = path.split('/');
    const pathnameWithoutLocale = segments.length > 2 ? '/' + segments.slice(2).join('/') : '/';

    if (pathnameWithoutLocale.startsWith('/admin')) {
      return true;
    }

    const lastView = sessionStorage.getItem('lastView');
    return lastView === 'admin';
  });

  // Use layoutEffect to update BEFORE paint to avoid flicker
  useLayoutEffect(() => {
    const isEditor =
      session?.user?.roles?.includes('EDITOR') || session?.user?.roles?.includes('ADMIN');

    // If on admin route, always show admin nav (if user is editor)
    if (isOnAdminRoute && isEditor) {
      setShowAdminNav(true);
      sessionStorage.setItem('lastView', 'admin');
      setIsReady(true);
      return;
    }

    // If on home page (/), always show player nav
    if (pathname === '/') {
      setShowAdminNav(false);
      sessionStorage.setItem('lastView', 'player');
      setIsReady(true);
      return;
    }

    // If not on admin route or home page, check sessionStorage
    const lastView = sessionStorage.getItem('lastView');
    const shouldShowAdmin = lastView === 'admin' && !!isEditor && !isOnAdminRoute;

    // Update state before paint
    setShowAdminNav(shouldShowAdmin);
    setIsReady(true);

    // Set the lastView based on what we're showing
    if (!lastView || isOnAdminRoute) {
      sessionStorage.setItem('lastView', shouldShowAdmin || isOnAdminRoute ? 'admin' : 'player');
    }
  }, [session, pathname, isOnAdminRoute]);

  // Listen for storage changes to detect view switches
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lastView' && e.newValue) {
        const isEditor =
          session?.user?.roles?.includes('EDITOR') || session?.user?.roles?.includes('ADMIN');

        // URL takes precedence
        if (isOnAdminRoute && isEditor) {
          setShowAdminNav(true);
          return;
        }

        const shouldShowAdmin = e.newValue === 'admin' && !!isEditor && !isOnAdminRoute;
        setShowAdminNav(shouldShowAdmin);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [session, isOnAdminRoute]);

  // Don't render until we've determined the correct nav to avoid flicker
  if (!isReady) {
    return <div className="h-16 bg-card border-b border-border/50" />;
  }

  // Render the appropriate nav
  return showAdminNav ? <AdminNav /> : <PlayerNav />;
}
