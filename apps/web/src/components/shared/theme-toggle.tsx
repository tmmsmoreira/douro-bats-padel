'use client';

import * as React from 'react';
import { MoonIcon, SunIcon } from 'lucide-animated';
import { useTheme } from 'next-themes';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { useHaptic } from '@/hooks/use-haptic';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const haptic = useHaptic();
  const [mounted, setMounted] = React.useState(false);
  const iconRef = React.useRef<{ startAnimation: () => void; stopAnimation: () => void }>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <DropdownMenuItem disabled className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SunIcon size={16} />
          <span>Theme</span>
        </div>
        <Switch disabled checked={false} />
      </DropdownMenuItem>
    );
  }

  const isDark = theme === 'dark';

  const handleToggle = () => {
    haptic.selection();
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <DropdownMenuItem
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onSelect={(e) => e.preventDefault()}
      onClick={handleToggle}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        {isDark ? <MoonIcon size={16} ref={iconRef} /> : <SunIcon size={16} ref={iconRef} />}
        <span>{isDark ? 'Dark mode' : 'Light mode'}</span>
      </div>
      <Switch
        checked={isDark}
        onCheckedChange={handleToggle}
        onClick={(e) => e.stopPropagation()}
      />
    </DropdownMenuItem>
  );
}
