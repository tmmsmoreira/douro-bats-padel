import { Suspense } from 'react';
import { RegisterForm } from '@/components/auth/register-form';
import { AuthPageLayout } from '@/components/auth';
import { LoadingState } from '@/components/shared';

export default function RegisterPage() {
  return (
    <AuthPageLayout
      title="Douro Bats Padel"
      subtitle="Join our padel community today"
      imageUrl="https://images.pexels.com/photos/31012869/pexels-photo-31012869.jpeg?auto=compress&cs=tinysrgb&w=2070"
      imageAlt="Padel court"
      fancyTitle
      bottomDescription="Get started"
      bottomTitle="Create Your Account"
    >
      <Suspense fallback={<LoadingState />}>
        <RegisterForm />
      </Suspense>
    </AuthPageLayout>
  );
}
