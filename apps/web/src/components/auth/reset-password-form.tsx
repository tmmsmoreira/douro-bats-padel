'use client';

import type React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useAuthFetch } from '@/hooks/use-api';

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const t = useTranslations('auth.resetPassword');
  const locale = useLocale();
  const authFetch = useAuthFetch();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError(t('passwordTooShort'));
      setIsLoading(false);
      return;
    }

    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError(
        t('passwordRequirements') ||
          'Password must contain at least one uppercase letter and one number'
      );
      setIsLoading(false);
      return;
    }

    try {
      await authFetch.post('/auth/reset-password', { token, password });
      router.push(`/${locale}/login?reset=true`);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t('failedToReset'));
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              {t('password')}
            </label>
            <input
              id="password"
              type="password"
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
              minLength={6}
              aria-invalid={!!error}
              aria-describedby={error ? 'reset-password-error' : undefined}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              {t('confirmPasswordLabel')}
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder={t('confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
              minLength={6}
              aria-invalid={!!error}
              aria-describedby={error ? 'reset-password-error' : undefined}
            />
          </div>
          {error && (
            <p
              id="reset-password-error"
              role="alert"
              aria-live="assertive"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
            {isLoading ? t('resetting') : t('resetPassword')}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            <p>
              <Link href={`/${locale}/login`} className="text-primary hover:underline">
                {t('backToLogin')}
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
