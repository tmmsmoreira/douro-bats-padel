'use client';

import { Suspense } from 'react';
import { VerifyEmailForm } from '@/components/auth/verify-email-form';
import { CenteredAuthLayout } from '@/components/auth';

export default function VerifyEmailPage() {
  return (
    <CenteredAuthLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyEmailForm />
      </Suspense>
    </CenteredAuthLayout>
  );
}
