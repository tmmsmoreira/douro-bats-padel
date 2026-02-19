// Single source of truth for locales
export const locales = ['en', 'pt'] as const;
export type Locale = (typeof locales)[number];

export const i18n = {
  defaultLocale: 'en' as Locale,
  locales,
} as const;

export const localeNames: Record<Locale, string> = {
  en: 'English',
  pt: 'Português',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  pt: '🇵🇹',
};
