'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AdminNav } from '@/components/admin/admin-nav';
import { PlayerNav } from '@/components/player/player-nav';

/**
 * Adaptive navigation component that shows Admin or Player nav based on:
 * 1. User's previous navigation context (stored in sessionStorage)
 * 2. User's role (fallback to Player nav if not an editor)
 */
export function AdaptiveNav() {
  const { data: session } = useSession();
  const [showAdminNav, setShowAdminNav] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if user came from admin view
    const lastView = sessionStorage.getItem('lastView');
    const isEditor =
      session?.user?.roles?.includes('EDITOR') || session?.user?.roles?.includes('ADMIN');

    // Show admin nav if user came from admin AND is an editor
    setShowAdminNav(lastView === 'admin' && !!isEditor);
  }, [session]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return showAdminNav ? <AdminNav /> : <PlayerNav />;
}
