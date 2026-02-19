'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { LanguageToggleButton } from '@/components/language-toggle-button';
import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Invalid Reset Link</CardTitle>
          <CardDescription>This password reset link is invalid or has expired</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4">
            Please request a new password reset link.
          </p>
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">
            Request new reset link
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      {/* Top-right controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <ThemeToggleButton />
        <LanguageToggleButton />
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
