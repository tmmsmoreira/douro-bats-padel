'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';
import { useLocale } from 'next-intl';

export function LanguageMenuItems() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();

  const switchLocale = (newLocale: string) => {
    // Set cookie for locale preference
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;

    // Use next-intl's router which handles locale switching
    router.replace(pathname, { locale: newLocale as Locale });
  };

  return (
    <DropdownMenuRadioGroup value={currentLocale} onValueChange={switchLocale}>
      {locales.map((locale) => (
        <DropdownMenuRadioItem key={locale} value={locale}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{localeFlags[locale]}</span>
            <span>{localeNames[locale]}</span>
          </div>
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  );
}
