'use client';

import { useSession } from 'next-auth/react';

// Historically there was a separate EDITOR role; it was merged into ADMIN.
// This hook keeps its name for import compatibility but now checks ADMIN only.
export function useIsEditor() {
  const { data: session } = useSession();
  return session?.user?.roles?.includes('ADMIN');
}
