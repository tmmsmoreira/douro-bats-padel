'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ErrorPage } from '@/components/shared/error-page';

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
    console.error('Event error:', error);
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
