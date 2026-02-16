"use client"

import { usePathname, useRouter } from "next/navigation"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { i18n, localeNames, localeFlags, type Locale } from "@/i18n"

export function LanguageMenuItems() {
  const pathname = usePathname()
  const router = useRouter()

  const currentLocale = (pathname.split('/')[1] as Locale) || i18n.defaultLocale

  const switchLocale = (newLocale: Locale) => {
    // Set cookie for locale preference
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`
    
    // Replace the locale in the current path
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')
    
    router.push(newPath)
  }

  return (
    <>
      {i18n.locales.map((locale) => (
        <DropdownMenuItem
          key={locale}
          onClick={() => switchLocale(locale)}
          className={currentLocale === locale ? "bg-accent" : ""}
        >
          <span className="mr-2 text-lg">{localeFlags[locale]}</span>
          <span>{localeNames[locale]}</span>
        </DropdownMenuItem>
      ))}
    </>
  )
}

