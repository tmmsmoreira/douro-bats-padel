import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { i18n } from "./i18n/config"

function getLocale(request: any): string {
  // First priority: Check Accept-Language header from browser
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    // Parse the accept-language header
    const languages = acceptLanguage
      .split(',')
      .map((lang: string) => {
        const [locale, q = '1'] = lang.trim().split(';q=')
        // Extract just the language code (e.g., 'pt' from 'pt-BR' or 'pt-PT')
        const langCode = locale.split('-')[0].toLowerCase()
        return { locale: langCode, quality: parseFloat(q) }
      })
      .sort((a: any, b: any) => b.quality - a.quality)

    // Find the first matching locale from browser preferences
    for (const { locale } of languages) {
      if (i18n.locales.includes(locale as any)) {
        return locale
      }
    }
  }

  // Second priority: Check if there's a locale cookie (for manual language switching)
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value
  if (localeCookie && i18n.locales.includes(localeCookie as any)) {
    return localeCookie
  }

  // Fallback to English
  return i18n.defaultLocale
}

export default auth((req) => {
  const pathname = req.nextUrl.pathname

  // Check if the pathname already has a locale
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // If no locale in pathname, redirect to locale-prefixed path
  if (!pathnameHasLocale) {
    const locale = getLocale(req)
    const newUrl = new URL(`/${locale}${pathname}`, req.url)
    newUrl.search = req.nextUrl.search
    return NextResponse.redirect(newUrl)
  }

  // Extract locale from pathname for auth checks
  const locale = pathname.split('/')[1]
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/'

  const isLoggedIn = !!req.auth

  // Auth pages (login, register, etc.)
  const isAuthPage =
    pathnameWithoutLocale.startsWith("/login") ||
    pathnameWithoutLocale.startsWith("/signup") ||
    pathnameWithoutLocale.startsWith("/register") ||
    pathnameWithoutLocale.startsWith("/forgot-password") ||
    pathnameWithoutLocale.startsWith("/reset-password") ||
    pathnameWithoutLocale.startsWith("/verify-email") ||
    pathnameWithoutLocale.startsWith("/resend-verification")

  // Public pages that don't require authentication
  const isPublicPage =
    pathnameWithoutLocale === "/" ||
    pathnameWithoutLocale === "/leaderboard" ||
    pathnameWithoutLocale === "/events" ||
    pathnameWithoutLocale.startsWith("/events/") ||
    pathnameWithoutLocale === "/about" ||
    pathnameWithoutLocale === "/contact" ||
    pathnameWithoutLocale === "/faq" ||
    pathnameWithoutLocale === "/terms" ||
    pathnameWithoutLocale === "/privacy" ||
    pathnameWithoutLocale === "/cookies"

  // If user is logged in and tries to access auth pages, redirect to home
  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(`/${locale}`, req.url))
    }
    return NextResponse.next()
  }

  // Allow access to public pages without authentication
  if (isPublicPage) {
    return NextResponse.next()
  }

  // For all other pages, require authentication
  if (!isLoggedIn && !pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - icons (PWA icons)
     * - offline.html (PWA offline page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|manifest.json|icons|offline.html).*)",
  ],
}
