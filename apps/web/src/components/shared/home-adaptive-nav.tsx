'use client';

import { useSession } from 'next-auth/react';
import { HomeNav } from '@/components/public/home-nav';
import { UnifiedNav } from '@/components/shared/unified-nav';

/**
 * Navigation component for the home page that shows:
 * - HomeNav for unauthenticated users (with Sign In button)
 * - UnifiedNav for authenticated users (role-based navigation)
 */
export function HomeAdaptiveNav() {
  const { data: session, status } = useSession();

  if (status === 'unauthenticated' || !session) {
    return <HomeNav />;
  }

  return <UnifiedNav />;
}
