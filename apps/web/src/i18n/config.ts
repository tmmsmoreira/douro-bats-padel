export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'pt'],
} as const

export type Locale = (typeof i18n)['locales'][number]

export const localeNames: Record<Locale, string> = {
  en: 'English',
  pt: 'Português',
}

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  pt: '🇵🇹',
}

