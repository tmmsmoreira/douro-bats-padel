import { Suspense } from 'react';
import { RegisterForm } from '@/components/auth/register-form';
import { AuthPageLayout } from '@/components/auth';
import { LoadingState } from '@/components/shared';

export default function RegisterPage() {
  return (
    <AuthPageLayout>
      <Suspense fallback={<LoadingState />}>
        <RegisterForm />
      </Suspense>
    </AuthPageLayout>
  );
}
