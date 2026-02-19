'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

export function LanguageMenuItems() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();

  const switchLocale = (newLocale: Locale) => {
    // Set cookie for locale preference
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;

    // Use next-intl's router which handles locale switching
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <>
      {locales.map((locale) => (
        <DropdownMenuItem
          key={locale}
          onClick={() => switchLocale(locale)}
          className={cn(currentLocale === locale ? 'bg-accent' : '', 'cursor-pointer flex gap-2')}
        >
          <span className="text-lg">{localeFlags[locale]}</span>
          <span>{localeNames[locale]}</span>
        </DropdownMenuItem>
      ))}
    </>
  );
}
