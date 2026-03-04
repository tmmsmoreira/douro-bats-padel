'use client';

import { useState, useLayoutEffect, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminNav } from '@/components/admin/admin-nav';
import { PlayerNav } from '@/components/player/player-nav';

/**
 * Adaptive navigation component that shows Admin or Player nav based on:
 * 1. User's previous navigation context (stored in sessionStorage)
 * 2. User's role (fallback to Player nav if not an editor)
 *
 * This component animates ONLY when switching between Admin and Player views,
 * not when navigating between pages within the same view.
 */
export function AdaptiveNav() {
  const { data: session } = useSession();
  const [isReady, setIsReady] = useState(false);

  // Initialize state by checking sessionStorage synchronously
  // This prevents the flicker by reading the value before first render
  const [showAdminNav, setShowAdminNav] = useState(() => {
    if (typeof window === 'undefined') return false;
    const lastView = sessionStorage.getItem('lastView');
    return lastView === 'admin';
  });

  // Use layoutEffect to update BEFORE paint to avoid flicker
  useLayoutEffect(() => {
    const lastView = sessionStorage.getItem('lastView');
    const isEditor =
      session?.user?.roles?.includes('EDITOR') || session?.user?.roles?.includes('ADMIN');

    // Show admin nav if user came from admin AND is an editor
    const shouldShowAdmin = lastView === 'admin' && !!isEditor;

    // Update state before paint
    setShowAdminNav(shouldShowAdmin);
    setIsReady(true);

    // Set the lastView based on what we're showing (but don't override explicit switches)
    if (!lastView) {
      sessionStorage.setItem('lastView', shouldShowAdmin ? 'admin' : 'player');
    }
  }, [session]);

  // Listen for storage changes to detect view switches
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lastView' && e.newValue) {
        const isEditor =
          session?.user?.roles?.includes('EDITOR') || session?.user?.roles?.includes('ADMIN');
        const shouldShowAdmin = e.newValue === 'admin' && !!isEditor;
        setShowAdminNav(shouldShowAdmin);
      }
    };

    // Also listen for custom events (for same-window updates)
    const handleCustomStorageChange = () => {
      const lastView = sessionStorage.getItem('lastView');
      const isEditor =
        session?.user?.roles?.includes('EDITOR') || session?.user?.roles?.includes('ADMIN');
      const shouldShowAdmin = lastView === 'admin' && !!isEditor;
      setShowAdminNav(shouldShowAdmin);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('viewChanged', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('viewChanged', handleCustomStorageChange);
    };
  }, [session]);

  // Don't render until we've determined the correct nav to avoid flicker
  if (!isReady) {
    return <div className="h-16 bg-card border-b border-border/50" />;
  }

  // Use AnimatePresence with a key to animate only when the view type changes
  return showAdminNav ? <AdminNav /> : <PlayerNav />;
}
