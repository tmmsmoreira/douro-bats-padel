import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { Providers } from "@/components/providers"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { locales, type Locale } from "@/i18n/config"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Douro Bats Padel",
  description: "Manage padel game nights, RSVPs, draws, and rankings for Douro Bats Padel Club",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Douro Bats",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }))
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  // Validate that the locale is supported
  if (!locales.includes(lang as Locale)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(lang)

  const messages = await getMessages({ locale: lang })

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
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <NextIntlClientProvider locale={lang} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  )
}

