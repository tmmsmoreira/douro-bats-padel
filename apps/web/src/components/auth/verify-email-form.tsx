'use client';

import type React from 'react';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useAuthFetch } from '@/hooks/use-api';
import { TIMINGS } from '@/lib/constants';

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth.verifyEmail');
  const locale = useLocale();
  const authFetch = useAuthFetch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const verifyEmail = useCallback(
    async (token: string) => {
      try {
        const data = await authFetch.post<{ message?: string }>('/auth/verify-email', { token });
        setSuccess(true);
        setMessage(data.message ?? '');
        setIsLoading(false);

        setTimeout(() => {
          router.push(`/${locale}/login`);
        }, TIMINGS.ONLINE_TOAST_MS);
      } catch (err) {
        setError(err instanceof Error && err.message ? err.message : t('verificationError'));
        setIsLoading(false);
      }
    },
    [router, t, locale, authFetch]
  );

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError(t('invalidLink'));
      setIsLoading(false);
      return;
    }

    verifyEmail(token);
  }, [searchParams, verifyEmail, t]);

  if (isLoading) {
    return (
      <Card className="glass-card w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="glass-card w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('successTitle')}</CardTitle>
          <CardDescription>{t('successDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="flex justify-center py-4">
            <svg
              className="h-16 w-16 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-center text-sm text-muted-foreground">{message}</p>
          <p className="text-center text-sm text-muted-foreground">{t('redirecting')}</p>
          <Link href={`/${locale}/login`} className="block">
            <Button className="gradient-primary w-full">{t('goToLogin')}</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('errorTitle')}</CardTitle>
        <CardDescription>{t('errorDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="flex justify-center py-4">
          <svg
            className="h-16 w-16 text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-sm text-destructive text-center">{error}</p>
        <p className="text-sm text-muted-foreground text-center">{t('linkExpired')}</p>
        <Link href={`/${locale}/resend-verification`} className="block">
          <Button variant="outline" className="w-full">
            {t('resendVerification')}
          </Button>
        </Link>
        <Link href={`/${locale}/login`} className="block">
          <Button variant="ghost" className="w-full">
            {t('backToLogin')}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
