'use client';

import { useSession } from 'next-auth/react';
import { HomeNav } from '@/components/public/home-nav';
import { AdaptiveNav } from '@/components/shared/adaptive-nav';

/**
 * Navigation component for the home page that shows:
 * - HomeNav for unauthenticated users (with Sign In button)
 * - AdaptiveNav for authenticated users (shows PlayerNav or AdminNav based on context)
 */
export function HomeAdaptiveNav() {
  const { data: session, status } = useSession();

  // Show HomeNav for unauthenticated users
  if (status === 'unauthenticated' || !session) {
    return <HomeNav />;
  }

  // Show AdaptiveNav for authenticated users
  return <AdaptiveNav />;
}
