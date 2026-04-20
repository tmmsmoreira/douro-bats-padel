'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ErrorPage } from '@/components/shared/state/error-page';
import { logRouteError } from '@/lib/utils';

export default function EventError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');
  const router = useRouter();

  useEffect(() => {
    logRouteError('event-detail', error);
  }, [error]);

  return (
    <ErrorPage
      title={t('failedToLoadEvent')}
      description={t('failedToLoadEventDescription')}
      actions={
        <>
          <Button onClick={reset} variant="default">
            {t('tryAgain')}
          </Button>
          <Button onClick={() => router.back()} variant="outline">
            {t('goBack')}
          </Button>
        </>
      }
    />
  );
}
