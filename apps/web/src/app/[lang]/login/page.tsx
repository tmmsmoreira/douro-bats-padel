'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { AuthPageLayout } from '@/components/auth';
import { LoadingState } from '@/components/shared';

export default function LoginPage() {
  return (
    <AuthPageLayout
      title="Douro Bats Padel"
      subtitle="Manage your padel game nights with ease"
      imageUrl="https://images.pexels.com/photos/31012869/pexels-photo-31012869.jpeg?auto=compress&cs=tinysrgb&w=2070"
      imageAlt="Padel court"
      bottomDescription="Track your games"
      bottomTitle="Organize & Play"
      animate
    >
      <Suspense fallback={<LoadingState />}>
        <LoginForm />
      </Suspense>
    </AuthPageLayout>
  );
}
