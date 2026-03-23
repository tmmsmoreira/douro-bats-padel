'use client';

import * as React from 'react';
import { MoonIcon, SunIcon } from 'lucide-animated';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export const ThemeToggleButton = React.forwardRef<HTMLButtonElement>(
  function ThemeToggleButton(_props, ref) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) {
      return (
        <Button ref={ref} variant="ghost" size="icon" disabled>
          <SunIcon size={20} />
          <span className="sr-only">Toggle theme</span>
        </Button>
      );
    }

    const isDark = theme === 'dark';

    const toggleTheme = () => {
      setTheme(isDark ? 'light' : 'dark');
    };

    return (
      <Button ref={ref} variant="ghost" size="icon" onClick={toggleTheme}>
        {isDark ? <MoonIcon size={20} /> : <SunIcon size={16} />}
        <span className="sr-only">Toggle theme</span>
      </Button>
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
