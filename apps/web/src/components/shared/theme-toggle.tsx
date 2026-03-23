'use client';

import * as React from 'react';
import { MoonIcon, SunIcon } from 'lucide-animated';
import { useTheme } from 'next-themes';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const iconRef = React.useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(
    null
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <DropdownMenuItem
      disabled={!mounted}
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onSelect={(e) => e.preventDefault()}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-2 pointer-events-none">
        {mounted && isDark ? (
          <MoonIcon size={16} ref={iconRef} />
        ) : (
          <SunIcon size={16} ref={mounted ? iconRef : undefined} />
        )}
        <span>{mounted ? (isDark ? 'Dark mode' : 'Light mode') : 'Theme'}</span>
      </div>
      <Switch
        checked={mounted ? isDark : false}
        onCheckedChange={handleToggle}
        onClick={(e) => e.stopPropagation()}
        disabled={!mounted}
      />
    </DropdownMenuItem>
  );
}
