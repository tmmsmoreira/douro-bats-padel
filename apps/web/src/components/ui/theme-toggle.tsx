'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-between px-2 py-1.5">
        <div className="flex items-center gap-2">
          <Sun className="h-4 w-4" />
          <span className="text-sm">Theme</span>
        </div>
        <Switch disabled checked={false} />
      </div>
    );
  }

  const isDark = theme === 'dark';

  const handleToggle = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light';
    console.log('Switching theme to:', newTheme);
    setTheme(newTheme);
  };

  return (
    <div className="flex items-center justify-between px-2 py-1.5">
      <div className="flex items-center gap-2">
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        <span className="text-sm">{isDark ? 'Dark mode' : 'Light mode'}</span>
      </div>
      <Switch checked={isDark} onCheckedChange={handleToggle} />
    </div>
  );
}
