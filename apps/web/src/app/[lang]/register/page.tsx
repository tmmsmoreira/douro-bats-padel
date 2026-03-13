import { Suspense } from 'react';
import { RegisterForm } from '@/components/auth/register-form';
import { AuthPageLayout } from '@/components/auth';

export default function RegisterPage() {
  return (
    <AuthPageLayout
      title="Douro Bats Padel"
      subtitle="Join our padel community today"
      imageUrl="https://images.pexels.com/photos/31012869/pexels-photo-31012869.jpeg?auto=compress&cs=tinysrgb&w=2070"
      imageAlt="Padel court"
      showGradientEffect
      bottomContent={
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <p className="text-sm text-white/80 mb-1">Get started</p>
          <p className="text-2xl font-semibold">Create Your Account</p>
        </div>
      }
    >
      <Suspense fallback={<div>Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </AuthPageLayout>
  );
}
