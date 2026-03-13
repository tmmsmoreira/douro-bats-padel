'use client';

import { Suspense } from 'react';
import { VerifyEmailForm } from '@/components/auth/verify-email-form';
import { CenteredAuthLayout } from '@/components/auth';
import { LoadingState } from '@/components/shared';

export default function VerifyEmailPage() {
  return (
    <CenteredAuthLayout>
      <Suspense fallback={<LoadingState />}>
        <VerifyEmailForm />
      </Suspense>
    </CenteredAuthLayout>
  );
}
