'use client';

import type React from 'react';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function ResendVerificationForm() {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to send verification email');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      // For development: show the token
      if (data.token) {
        setVerificationToken(data.token);
      }
      setIsLoading(false);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>Verification email has been sent</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <p className="text-sm text-muted-foreground">
            If an account exists with the email <strong>{email}</strong> and is not yet verified,
            you will receive a verification email.
          </p>
          {verificationToken && (
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
              Back to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Resend Verification Email</CardTitle>
        <CardDescription>Enter your email to receive a new verification link</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Resend Verification Email'}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Already verified?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
