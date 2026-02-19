import { RegisterForm } from '@/components/auth/register-form';
import { LanguageToggleButton } from '@/components/language-toggle-button';
import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';
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
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-black/20" />
        <Image
          src="https://images.pexels.com/photos/31012869/pexels-photo-31012869.jpeg?auto=compress&cs=tinysrgb&w=2070"
          alt="Padel court"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <h1 className="text-4xl font-bold mb-2">Douro Bats Padel</h1>
            <p className="text-lg text-white/90">Join our padel community today</p>
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
        <RegisterForm />
      </div>
    </div>
  );
}
