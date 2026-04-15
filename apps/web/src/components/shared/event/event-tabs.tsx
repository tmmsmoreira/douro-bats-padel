'use client';

import { useState, useTransition, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';

interface EventTab {
  label: string;
  href: string;
  match: (pathname: string) => boolean;
}

interface EventTabsProps {
  eventId: string;
  basePath: string; // '/events' or '/admin/events'
  tabs: ('details' | 'draw' | 'results' | 'edit')[];
  className?: string;
}

export function EventTabs({ eventId, basePath, tabs, className }: EventTabsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('eventTabs');
  const [, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Clear pending state once navigation completes
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const tabConfig: Record<string, EventTab> = {
    details: {
      label: t('details'),
      href: `${basePath}/${eventId}`,
      match: (path) => path === `${basePath}/${eventId}` || path.endsWith(`${basePath}/${eventId}`),
    },
    draw: {
      label: t('draw'),
      href: `${basePath}/${eventId}/draw`,
      match: (path) => path.includes('/draw'),
    },
    results: {
      label: t('results'),
      href: `${basePath}/${eventId}/results`,
      match: (path) => path.includes('/results'),
    },
    edit: {
      label: t('edit'),
      href: `${basePath}/${eventId}/edit`,
      match: (path) => path.includes('/edit'),
    },
  };

  const visibleTabs = tabs.map((key) => tabConfig[key]).filter(Boolean);

  return (
    <div className={cn('border-b border-border', className)}>
      <nav className="flex space-x-8 md:space-x-8" aria-label="Event navigation">
        {visibleTabs.map((tab) => {
          const isActive = pendingHref ? tab.href === pendingHref : tab.match(pathname);
          return (
            <button
              key={tab.href}
              type="button"
              onClick={() => {
                if (!isActive) {
                  setPendingHref(tab.href);
                  startTransition(() => {
                    router.replace(tab.href);
                  });
                }
              }}
              className={cn(
                'relative flex-1 md:flex-none text-center md:text-left py-4 px-1 text-sm font-medium transition-colors cursor-pointer',
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
