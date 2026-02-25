'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { i18n, localeFlags, localeNames, type Locale } from '@/i18n';

export function LanguageToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentLocale = (pathname.split('/')[1] as Locale) || i18n.defaultLocale;
  const isPortuguese = currentLocale === 'pt';
  const displayFlag = localeFlags[currentLocale];
  const displayName = localeNames[currentLocale];

  const toggleLanguage = (checked: boolean) => {
    const newLocale: Locale = checked ? 'pt' : 'en';

    // Set cookie for locale preference
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;

    // Replace the locale in the current path
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');

    router.push(newPath);
  };

  // Show the same content during SSR and after hydration to prevent flash
  return (
    <div className="flex items-center justify-between px-2 py-1.5">
      <div className="flex items-center gap-2">
        <span className="text-xl">{displayFlag}</span>
        <span className="text-sm">{displayName}</span>
      </div>
      <Switch checked={isPortuguese} onCheckedChange={toggleLanguage} disabled={!mounted} />
    </div>
  );
}
