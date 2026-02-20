'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { i18n, localeFlags, type Locale } from '@/i18n';

export function LanguageToggleButton() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentLocale = (pathname.split('/')[1] as Locale) || i18n.defaultLocale;
  const displayFlag = localeFlags[currentLocale];

  const toggleLanguage = () => {
    const newLocale: Locale = currentLocale === 'en' ? 'pt' : 'en';

    // Set cookie for locale preference
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;

    // Replace the locale in the current path
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');

    router.push(newPath);
  };

  // Show the same flag during SSR and after hydration to prevent flash
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      disabled={!mounted}
      className="text-xl"
      aria-label={`Switch to ${currentLocale === 'en' ? 'Portuguese' : 'English'}`}
    >
      {displayFlag}
    </Button>
  );
}
