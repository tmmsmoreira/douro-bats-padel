import type React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { Providers } from '@/components/providers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';
import { auth } from '@/lib/auth';
import { AppLoadingScreen } from '@/components/shared/app-loading-screen';
import { OfflineIndicator } from '@/components/shared/offline-indicator';
import { PullToRefresh } from '@/components/shared/pull-to-refresh';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Douro Bats Padel',
  description: 'Manage padel game nights, RSVPs, draws, and rankings for Douro Bats Padel Club',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Douro Bats',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', // Enable safe area insets for notched devices
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  // Validate that the locale is supported
  if (!locales.includes(lang as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(lang);

  // Fetch session server-side to prevent hydration flash
  const session = await auth();
  const messages = await getMessages({ locale: lang });

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <meta name="application-name" content="Douro Bats Padel" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Douro Bats" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-touch-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/apple-touch-icon-167x167.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon-precomposed" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers session={session}>
          <NextIntlClientProvider locale={lang} messages={messages}>
            <AppLoadingScreen minDuration={800} />
            <OfflineIndicator />
            <PullToRefresh />
            {children}
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
