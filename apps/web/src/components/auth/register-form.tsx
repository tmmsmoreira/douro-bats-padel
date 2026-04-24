'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useAuthFetch } from '@/hooks/use-api';

export function RegisterForm() {
  const searchParams = useSearchParams();
  const t = useTranslations('auth.register');
  const locale = useLocale();
  const authFetch = useAuthFetch();
  const invitationToken = searchParams.get('invitation');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [validatingInvitation, setValidatingInvitation] = useState(true);
  const [invitationValid, setInvitationValid] = useState(false);
  const [invitationEmail, setInvitationEmail] = useState('');

  // Validate invitation token on mount
  useEffect(() => {
    const validateInvitation = async () => {
      if (!invitationToken) {
        setValidatingInvitation(false);
        setInvitationValid(false);
        return;
      }

      try {
        const data = await authFetch.post<{
          valid: boolean;
          email?: string;
          name?: string;
          message?: string;
        }>('/invitations/validate', { token: invitationToken });

        if (data.valid && data.email) {
          setInvitationValid(true);
          setInvitationEmail(data.email);
          setEmail(data.email);
          if (data.name) setName(data.name);
        } else {
          setInvitationValid(false);
          setError(data.message || t('invalidInvitation'));
        }
      } catch (err) {
        setInvitationValid(false);
        setError(err instanceof Error && err.message ? err.message : t('failedToValidate'));
      } finally {
        setValidatingInvitation(false);
      }
    };

    validateInvitation();
  }, [invitationToken, t, authFetch]);

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

    // Validate email matches invitation
    if (email !== invitationEmail) {
      setError(t('emailMustMatch'));
      setIsLoading(false);
      return;
    }

    try {
      const data = await authFetch.post<{ token?: string }>('/auth/signup', {
        name,
        email,
        password,
        invitationToken,
        language: locale.toUpperCase(),
      });

      setSuccess(true);
      if (data.token) setVerificationToken(data.token);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t('registrationFailed'));
      setIsLoading(false);
    }
  };

  // Show loading state while validating invitation
  if (validatingInvitation) {
    return (
      <Card className="glass-card w-full max-w-md">
        <CardContent className="py-12 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('validatingInvitation')}</p>
        </CardContent>
      </Card>
    );
  }

  // Show error if no invitation token or invalid
  if (!invitationToken || !invitationValid) {
    return (
      <Card className="glass-card w-full max-w-md">
        <CardHeader className="space-y-1 px-4 sm:px-6 pt-6">
          <CardTitle className="text-xl sm:text-2xl">{t('invitationRequired')}</CardTitle>
          <CardDescription className="text-sm">
            {t('invitationRequiredDescription')}
          </CardDescription>
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <p className="text-sm text-muted-foreground text-center">{t('invitationOnlyMessage')}</p>
          <Link href={`/${locale}/login`} className="block">
            <Button variant="outline" className="w-full">
              {t('goToLogin')}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full glass-card max-w-md">
        <CardHeader className="space-y-1 px-4 sm:px-6 pt-6">
          <CardTitle className="text-xl sm:text-2xl">{t('successTitle')}</CardTitle>
          <CardDescription className="text-sm">{t('successDescription')}</CardDescription>
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
          <p className="text-sm text-muted-foreground text-center">
            {t('successMessage', { email })}
          </p>
          {process.env.NODE_ENV === 'development' && verificationToken && (
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
              {t('goToLogin')}
            </Button>
          </Link>
          <div className="text-center text-sm text-muted-foreground">
            <p>
              {t('didntReceiveEmail')}{' '}
              <Link
                href={`/${locale}/resend-verification`}
                className="text-primary hover:underline"
              >
                {t('resendVerification')}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="space-y-1 px-4 sm:px-6 pt-6">
        <CardTitle className="text-2xl sm:text-3xl font-bold">{t('title')}</CardTitle>
        <CardDescription className="text-sm">{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 px-4 sm:px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t('namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
              required
              aria-invalid={!!error}
              aria-describedby={error ? 'register-error' : undefined}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 bg-muted"
              required
              readOnly
              disabled
              aria-describedby="email-help"
            />
            <p id="email-help" className="text-xs text-muted-foreground">
              {t('emailPreFilled')}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
              required
              minLength={6}
              aria-invalid={!!error}
              aria-describedby={error ? 'register-error' : undefined}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t('confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11"
              required
              minLength={6}
              aria-invalid={!!error}
              aria-describedby={error ? 'register-error' : undefined}
            />
          </div>
          {error && (
            <div
              id="register-error"
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
            {isLoading ? t('creatingAccount') : t('createAccount')}
          </Button>

          <div className="text-center text-sm text-muted-foreground pt-4">
            <p>
              {t('alreadyHaveAccount')}{' '}
              <Link href={`/${locale}/login`} className="text-primary hover:underline font-medium">
                {t('signIn')}
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
