import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { AuthPageLayout } from '@/components/auth';

export default function LoginPage() {
  return (
    <AuthPageLayout
      title="Douro Bats Padel"
      subtitle="Manage your padel game nights with ease"
      imageUrl="https://images.pexels.com/photos/31012869/pexels-photo-31012869.jpeg?auto=compress&cs=tinysrgb&w=2070"
      imageAlt="Padel court"
      bottomContent={
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <p className="text-sm text-white/80 mb-1">Track your games</p>
          <p className="text-2xl font-semibold">Organize & Play</p>
        </div>
      }
    >
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </AuthPageLayout>
  );
}
