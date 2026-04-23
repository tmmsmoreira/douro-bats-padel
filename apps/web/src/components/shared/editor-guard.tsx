'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { useIsEditor } from '@/hooks/use-is-editor';
import { LoadingState } from '@/components/shared/state/loading-state';

interface EditorGuardProps {
  children: React.ReactNode;
  loadingMessage?: string;
}

/**
 * Wraps admin-only content with role-based access control.
 * Shows a loading state while the session is being checked,
 * triggers a 404 if the user doesn't have the ADMIN role.
 * (Historically named "editor" before the EDITOR role was merged into ADMIN.)
 */
export function EditorGuard({ children, loadingMessage }: EditorGuardProps) {
  const { status } = useSession();
  const isEditor = useIsEditor();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Session still loading
  if (status === 'loading') {
    return <LoadingState message={loadingMessage} />;
  }

  // Not authenticated
  if (status === 'unauthenticated') {
    return <LoadingState message={loadingMessage} />;
  }

  // Authenticated but not an editor — show as not found
  if (isEditor === false) {
    notFound();
  }

  // Still resolving role (isEditor is undefined while session user loads)
  if (isEditor === undefined) {
    return <LoadingState message={loadingMessage} />;
  }

  return <>{children}</>;
}
