'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export function RegisterForm() {
  const searchParams = useSearchParams();
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invitations/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: invitationToken }),
        });

        const data = await res.json();

        if (data.valid) {
          setInvitationValid(true);
          setInvitationEmail(data.email);
          setEmail(data.email); // Pre-fill email
        } else {
          setInvitationValid(false);
          setError(data.message || 'Invalid invitation');
        }
      } catch {
        setInvitationValid(false);
        setError('Failed to validate invitation');
      } finally {
        setValidatingInvitation(false);
      }
    };

    validateInvitation();
  }, [invitationToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    // Validate email matches invitation
    if (email !== invitationEmail) {
      setError('Email must match the invitation email');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          invitationToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Registration failed');
        setIsLoading(false);
        return;
      }

      // Registration successful, show success message
      setSuccess(true);
      // For development: show the token
      if (data.token) {
        setVerificationToken(data.token);
      }
      setIsLoading(false);
    } catch {
      setError('An error occurred during registration');
      setIsLoading(false);
    }
  };

  // Show loading state while validating invitation
  if (validatingInvitation) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="py-12 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Validating invitation...</p>
        </CardContent>
      </Card>
    );
  }

  // Show error if no invitation token or invalid
  if (!invitationToken || !invitationValid) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 px-4 sm:px-6 pt-6">
          <CardTitle className="text-xl sm:text-2xl">Invitation Required</CardTitle>
          <CardDescription className="text-sm">
            You need a valid invitation to create an account
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
          <p className="text-sm text-muted-foreground text-center">
            This application is invitation-only. Please contact an administrator to receive an
            invitation link.
          </p>
          <Link href="/login" className="block">
            <Button variant="outline" className="w-full">
              Go to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 px-4 sm:px-6 pt-6">
          <CardTitle className="text-xl sm:text-2xl">Check Your Email</CardTitle>
          <CardDescription className="text-sm">Registration successful!</CardDescription>
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
            We&apos;ve sent a verification email to <strong>{email}</strong>. Please check your
            inbox and click the verification link to activate your account.
          </p>
          {process.env.NODE_ENV === 'development' && verificationToken && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm font-medium text-yellow-800 mb-2">
                Development Mode - Verification Token:
              </p>
              <code className="text-xs bg-white p-2 block rounded border break-all">
                {verificationToken}
              </code>
              <Link
                href={`/verify-email?token=${verificationToken}`}
                className="text-sm text-yellow-800 hover:underline mt-2 inline-block"
              >
                Click here to verify
              </Link>
            </div>
          )}
          <Link href="/login" className="block">
            <Button variant="outline" className="w-full">
              Go to Login
            </Button>
          </Link>
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Didn&apos;t receive the email?{' '}
              <Link href="/resend-verification" className="text-primary hover:underline">
                Resend verification
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="space-y-1 px-4 sm:px-6 pt-6">
        <CardTitle className="text-2xl sm:text-3xl font-bold">Create Account</CardTitle>
        <CardDescription className="text-sm">Join the Douro Bats Padel community</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 px-4 sm:px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="hello@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 bg-muted"
              required
              readOnly
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Email is pre-filled from your invitation
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11"
              required
              minLength={6}
            />
          </div>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>

          <div className="text-center text-sm text-muted-foreground pt-4">
            <p>
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
