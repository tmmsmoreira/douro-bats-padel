'use client';

import * as React from 'react';
import { MoonIcon, SunIcon } from 'lucide-animated';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
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
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {isDark ? <MoonIcon size={20} /> : <SunIcon size={16} />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
