import { defineRouting } from 'next-intl/routing';
import { locales, i18n } from './config';

export const routing = defineRouting({
  locales,
  defaultLocale: i18n.defaultLocale,
  localePrefix: 'always',
});
