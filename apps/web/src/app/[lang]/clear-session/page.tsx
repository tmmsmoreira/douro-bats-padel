'use client';

import { signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function ClearSessionPage() {
  const router = useRouter();
  const t = useTranslations('clearSessionPage');

  useEffect(() => {
    // Clear the session and redirect to home
    signOut({ redirect: false }).then(() => {
      // Clear all cookies
      document.cookie.split(';').forEach((c) => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });

      // Redirect to home
      setTimeout(() => {
        router.push('/');
      }, 1000);
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>
    </div>
  );
}
