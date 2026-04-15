'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useIsEditor } from '@/hooks/use-is-editor';
import { LoadingState } from '@/components/shared/loading-state';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { BadgeAlertIcon } from 'lucide-animated';

interface EditorGuardProps {
  children: React.ReactNode;
  loadingMessage?: string;
}

/**
 * Wraps editor-only content with role-based access control.
 * Shows a loading state while the session is being checked,
 * redirects to home if the user doesn't have EDITOR/ADMIN role,
 * and renders children only when authorized.
 */
export function EditorGuard({ children, loadingMessage }: EditorGuardProps) {
  const { status } = useSession();
  const isEditor = useIsEditor();
  const router = useRouter();
  const t = useTranslations('errors');

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

  // Authenticated but not an editor — show access denied
  if (isEditor === false) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BadgeAlertIcon className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{t('accessDenied')}</EmptyTitle>
          <EmptyDescription>{t('accessDeniedDescription')}</EmptyDescription>
        </EmptyHeader>
        <Link href="/">
          <Button variant="outline">{t('goHome')}</Button>
        </Link>
      </Empty>
    );
  }

  // Still resolving role (isEditor is undefined while session user loads)
  if (isEditor === undefined) {
    return <LoadingState message={loadingMessage} />;
  }

  return <>{children}</>;
}
