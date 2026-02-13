"use client"

import { usePathname } from "next/navigation"
import { i18n, type Locale } from "@/i18n"

export function useLocale(): Locale {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] as Locale
  
  if (i18n.locales.includes(locale)) {
    return locale
  }
  
  return i18n.defaultLocale
}

