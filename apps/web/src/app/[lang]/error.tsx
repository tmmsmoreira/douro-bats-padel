'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ErrorPage } from '@/components/shared/state/error-page';
import { logRouteError } from '@/lib/utils';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  useEffect(() => {
    logRouteError('app', error);
  }, [error]);

  return (
    <ErrorPage
      title={t('somethingWentWrong')}
      description={t('unexpectedError')}
      actions={
        <Button onClick={reset} variant="default">
          {t('tryAgain')}
        </Button>
      }
    />
  );
}
