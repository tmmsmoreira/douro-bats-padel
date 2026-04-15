'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { AuthPageLayout } from '@/components/auth';
import { LoadingState } from '@/components/shared';

export default function LoginPage() {
  return (
    <AuthPageLayout>
      <Suspense fallback={<LoadingState />}>
        <LoginForm />
      </Suspense>
    </AuthPageLayout>
  );
}
