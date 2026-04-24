'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { GoogleLogoIcon } from './google-logo-icon';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations('auth.login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage(t('accountCreatedSuccess'));
    }
    if (searchParams.get('reset') === 'true') {
      setSuccessMessage(t('passwordResetSuccess'));
    }
  }, [searchParams, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('invalidCredentials'));
        setIsLoading(false);
      } else {
        router.push(`/${locale}/events`);
        router.refresh();
        // Keep the button in loading state until navigation unmounts this component.
      }
    } catch {
      setError(t('errorOccurred'));
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Card className="glass-card w-full max-w-md">
        <CardHeader className="space-y-1 px-4 sm:px-6 pt-6">
          <CardTitle className="text-2xl sm:text-3xl font-bold">{t('title')}</CardTitle>
          <CardDescription className="text-sm">{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 px-4 sm:px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                required
                aria-invalid={!!error}
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('password')}</Label>
                <Link
                  href={`/${locale}/forgot-password`}
                  className="text-xs text-primary hover:underline"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                required
                aria-invalid={!!error}
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>
            {successMessage && (
              <div
                role="status"
                aria-live="polite"
                className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-md text-sm"
              >
                {successMessage}
              </div>
            )}
            {error && (
              <div
                id="login-error"
                role="alert"
                aria-live="assertive"
                className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm"
              >
                {error}
              </div>
            )}
            <Button
              type="submit"
              variant="gradient"
              className="w-full h-11 text-base"
              disabled={isLoading}
            >
              {isLoading ? t('signingIn') : t('signIn')}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t('orContinueWith')}</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              onClick={() => signIn('google', { callbackUrl: `/${locale}` })}
              disabled={isLoading}
            >
              <GoogleLogoIcon className="mr-2 h-4 w-4" />
              {t('signInWithGoogle')}
            </Button>

            {process.env.NODE_ENV === 'development' && (
              <div className="text-center text-sm text-muted-foreground pt-2 border-t mt-4">
                <p className="font-medium text-foreground mb-2">{t('demoCredentials')}</p>
                <div className="text-xs space-y-1">
                  <p>{t('demoPlayer')}</p>
                  <p>{t('demoAdmin')}</p>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
