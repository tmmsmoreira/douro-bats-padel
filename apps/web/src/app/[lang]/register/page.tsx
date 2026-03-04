import { Suspense } from 'react';
import { RegisterForm } from '@/components/auth/register-form';
import { LanguageToggleButton } from '@/components/shared/language-toggle-button';
import { ThemeToggleButton } from '@/components/shared/theme-toggle-button';
import Image from 'next/image';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex relative">
      {/* Top-right controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <ThemeToggleButton />
        <LanguageToggleButton />
      </div>

      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-black/20" />
        <Image
          src="https://images.pexels.com/photos/31012869/pexels-photo-31012869.jpeg?auto=compress&cs=tinysrgb&w=2070"
          alt="Padel court"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="relative">
            {/* Gradient glass effect container */}
            <div className="relative inline-block">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-linear-to-r from-primary/30 via-purple-500/30 to-pink-500/30 blur-2xl -z-10" />

              {/* Glass container */}
              <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
                <h1 className="text-4xl font-bold mb-2 font-heading gradient-text">
                  Douro Bats Padel
                </h1>
                <p className="text-lg text-white/90">Join our padel community today</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-sm text-white/80 mb-1">Get started</p>
              <p className="text-2xl font-semibold">Create Your Account</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="flex-1 flex items-center justify-center bg-background p-8">
        <Suspense fallback={<div>Loading...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
