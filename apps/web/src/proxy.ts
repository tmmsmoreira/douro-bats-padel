import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth

  // Auth pages (login, register, etc.)
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/signup") ||
    req.nextUrl.pathname.startsWith("/register") ||
    req.nextUrl.pathname.startsWith("/forgot-password") ||
    req.nextUrl.pathname.startsWith("/reset-password")

  // Public pages that don't require authentication
  const isPublicPage =
    req.nextUrl.pathname === "/" ||
    req.nextUrl.pathname === "/leaderboard" ||
    req.nextUrl.pathname === "/events" ||
    req.nextUrl.pathname.startsWith("/events/")

  // If user is logged in and tries to access auth pages, redirect to home
  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url))
    }
    return NextResponse.next()
  }

  // Allow access to public pages without authentication
  if (isPublicPage) {
    return NextResponse.next()
  }

  // For all other pages, require authentication
  if (!isLoggedIn && !req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/login", req.url))
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
