'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ErrorPage } from '@/components/shared/error-page';
import { logRouteError } from '@/lib/utils';

export default function EventsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  useEffect(() => {
    logRouteError('events', error);
  }, [error]);

  return (
    <ErrorPage
      title={t('failedToLoadEvents')}
      description={t('failedToLoadEventsDescription')}
      actions={
        <Button onClick={reset} variant="default">
          {t('tryAgain')}
        </Button>
      }
    />
  );
}
