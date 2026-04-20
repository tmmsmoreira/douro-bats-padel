'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { i18n, type Locale } from '@/i18n';
import { EnFlagIcon, PtFlagIcon } from '@/components/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const localeFlagComponents: Record<Locale, React.ComponentType<{ size?: number }>> = {
  en: EnFlagIcon,
  pt: PtFlagIcon,
};

export const LanguageToggleButton = React.forwardRef<HTMLButtonElement>(
  function LanguageToggleButton(_props, ref) {
    const pathname = usePathname();
    const router = useRouter();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    const currentLocale = (pathname.split('/')[1] as Locale) || i18n.defaultLocale;
    const otherLocale: Locale = currentLocale === 'en' ? 'pt' : 'en';
    const FlagIcon = localeFlagComponents[otherLocale];

    const toggleLanguage = () => {
      const newLocale: Locale = currentLocale === 'en' ? 'pt' : 'en';

      // Set cookie for locale preference
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;

      // Replace the locale in the current path
      const segments = pathname.split('/');
      segments[1] = newLocale;
      const newPath = segments.join('/');

      // Use replace instead of push to avoid adding to history
      // This makes the transition feel more like a state change than navigation
      router.replace(newPath);
    };

    const t = useTranslations('nav');
    const otherLanguageLabel =
      otherLocale === 'en' ? t('switchToEnglish') : t('switchToPortuguese');

    // Show the same flag during SSR and after hydration to prevent flash
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={ref}
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            disabled={!mounted}
            aria-label={otherLanguageLabel}
            animate
          >
            <FlagIcon size={20} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{otherLanguageLabel}</TooltipContent>
      </Tooltip>
    );
  }
);

// Toggle group version for mobile menu
export function LanguageToggleGroup() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentLocale = (pathname.split('/')[1] as Locale) || i18n.defaultLocale;

  const handleLanguageChange = (value: string) => {
    if (!value || value === currentLocale) return;

    const newLocale = value as Locale;

    // Set cookie for locale preference
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;

    // Replace the locale in the current path
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');

    // Use replace instead of push to avoid adding to history
    router.replace(newPath);
  };

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      value={currentLocale}
      onValueChange={handleLanguageChange}
      disabled={!mounted}
    >
      <ToggleGroupItem value="en" aria-label="English">
        <EnFlagIcon size={16} />
      </ToggleGroupItem>
      <ToggleGroupItem value="pt" aria-label="Portuguese">
        <PtFlagIcon size={16} />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
