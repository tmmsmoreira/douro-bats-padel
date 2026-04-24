'use client';

import type React from 'react';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useAuthFetch } from '@/hooks/use-api';

export function ForgotPasswordForm() {
  const t = useTranslations('auth.forgotPassword');
  const locale = useLocale();
  const authFetch = useAuthFetch();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const data = await authFetch.post<{ token?: string }>('/auth/forgot-password', { email });
      setSuccess(true);
      if (data.token) setResetToken(data.token);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t('failedToSend'));
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="glass-card w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('successTitle')}</CardTitle>
          <CardDescription>{t('successDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <p className="text-sm text-muted-foreground">{t('successMessage', { email })}</p>
          {process.env.NODE_ENV === 'development' && resetToken && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm font-medium text-yellow-800 mb-2">{t('devModeToken')}</p>
              <code className="text-xs bg-white p-2 block rounded border break-all">
                {resetToken}
              </code>
              <Link
                href={`/${locale}/reset-password?token=${resetToken}`}
                className="text-sm text-primary hover:underline mt-2 inline-block"
              >
                {t('clickToReset')}
              </Link>
            </div>
          )}
          <div className="text-center">
            <Link href={`/${locale}/login`} className="text-sm text-primary hover:underline">
              {t('backToLogin')}
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t('email')}
            </label>
            <input
              id="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
              aria-invalid={!!error}
              aria-describedby={error ? 'forgot-password-error' : undefined}
            />
          </div>
          {error && (
            <p
              id="forgot-password-error"
              role="alert"
              aria-live="assertive"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
            {isLoading ? t('sending') : t('sendResetLink')}
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
