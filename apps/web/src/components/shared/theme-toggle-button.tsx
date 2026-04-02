'use client';

import * as React from 'react';
import { MoonIcon, SunIcon } from 'lucide-animated';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export const ThemeToggleButton = React.forwardRef<HTMLButtonElement>(
  function ThemeToggleButton(_props, ref) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const t = useTranslations('nav');

    React.useEffect(() => {
      setMounted(true);
    }, []);

    const isDark = theme === 'dark';

    if (!mounted) {
      return (
        <Button ref={ref} variant="ghost" size="icon" disabled>
          <SunIcon size={20} />
          <span className="sr-only">{t('theme')}</span>
        </Button>
      );
    }

    const toggleTheme = () => {
      setTheme(isDark ? 'light' : 'dark');
    };

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button ref={ref} variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? <SunIcon size={20} /> : <MoonIcon size={20} />}
            <span className="sr-only">{t('theme')}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isDark ? t('lightMode') : t('darkMode')}</TooltipContent>
      </Tooltip>
    );
  }
);

// Toggle group version for mobile menu
export function ThemeToggleGroup() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (value: string) => {
    if (!value) return;
    setTheme(value);
  };

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      value={theme}
      onValueChange={handleThemeChange}
      disabled={!mounted}
    >
      <ToggleGroupItem value="light" aria-label="Light mode">
        <SunIcon size={16} />
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label="Dark mode">
        <MoonIcon size={16} />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
