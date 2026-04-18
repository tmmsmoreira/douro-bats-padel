'use client';

import type React from 'react';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useAuthFetch } from '@/hooks/use-api';

export function ResendVerificationForm() {
  const t = useTranslations('auth.resendVerification');
  const locale = useLocale();
  const authFetch = useAuthFetch();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const data = await authFetch.post<{ token?: string }>('/auth/resend-verification', {
        email,
      });
      setSuccess(true);
      if (data.token) setVerificationToken(data.token);
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
          {verificationToken && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm font-medium text-yellow-800 mb-2">{t('devModeToken')}</p>
              <code className="text-xs bg-white p-2 block rounded border break-all">
                {verificationToken}
              </code>
              <Link
                href={`/${locale}/verify-email?token=${verificationToken}`}
                className="text-sm text-yellow-800 hover:underline mt-2 inline-block"
              >
                {t('clickToVerify')}
              </Link>
            </div>
          )}
          <Link href={`/${locale}/login`} className="block">
            <Button variant="outline" className="w-full">
              {t('backToLogin')}
            </Button>
          </Link>
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
              aria-describedby={error ? 'resend-verification-error' : undefined}
            />
          </div>
          {error && (
            <p
              id="resend-verification-error"
              role="alert"
              aria-live="assertive"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <Button type="submit" className="gradient-primary w-full" disabled={isLoading}>
            {isLoading ? t('sending') : t('resendButton')}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            <p>
              {t('alreadyVerified')}{' '}
              <Link href={`/${locale}/login`} className="text-primary hover:underline">
                {t('signIn')}
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
