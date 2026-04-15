'use client';

import { useSession } from 'next-auth/react';

export function useIsEditor() {
  const { data: session } = useSession();
  return session?.user?.roles?.includes('EDITOR') || session?.user?.roles?.includes('ADMIN');
}
