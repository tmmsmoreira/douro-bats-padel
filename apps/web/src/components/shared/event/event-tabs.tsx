'use client';

import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('eventTabs');

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
      <nav className="flex space-x-8" aria-label="Event navigation">
        {visibleTabs.map((tab) => {
          const isActive = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'border-b-2 py-4 px-1 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
