'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export type EventStatus = 'DRAFT' | 'OPEN' | 'FROZEN' | 'DRAWN' | 'PUBLISHED';
export type PlayerStatus = 'CONFIRMED' | 'WAITLISTED' | 'PARTICIPATED';
export type Status = EventStatus | PlayerStatus;

interface StatusBadgeProps {
  status: Status;
  className?: string;
  label?: string;
}

const statusConfig: Record<
  Status,
  {
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
    className: string;
    dotColor: string;
    translationKey: string;
  }
> = {
  // Event statuses
  DRAFT: {
    variant: 'outline',
    className: 'border-warning/30 text-warning bg-warning/10',
    dotColor: 'bg-warning',
    translationKey: 'draft',
  },
  OPEN: {
    variant: 'default',
    className: 'bg-secondary/10 text-secondary border-secondary/30',
    dotColor: 'bg-secondary',
    translationKey: 'open',
  },
  FROZEN: {
    variant: 'secondary',
    className: 'bg-muted text-muted-foreground border-border',
    dotColor: 'bg-muted-foreground',
    translationKey: 'frozen',
  },
  DRAWN: {
    variant: 'secondary',
    className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    dotColor: 'bg-purple-500',
    translationKey: 'drawn',
  },
  PUBLISHED: {
    variant: 'default',
    className: 'bg-primary/10 text-primary border-primary/30',
    dotColor: 'bg-primary',
    translationKey: 'published',
  },
  // Player participation statuses
  CONFIRMED: {
    variant: 'default',
    className: 'bg-primary/10 text-primary border-primary/30',
    dotColor: 'bg-primary',
    translationKey: 'confirmed',
  },
  WAITLISTED: {
    variant: 'secondary',
    className: 'bg-muted text-muted-foreground border-border',
    dotColor: 'bg-muted-foreground',
    translationKey: 'waitlisted',
  },
  PARTICIPATED: {
    variant: 'outline',
    className:
      'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
    dotColor: 'bg-green-600',
    translationKey: 'participated',
  },
};

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  const t = useTranslations('status');
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'uppercase text-xs font-semibold px-3 py-1.5 rounded-full border flex items-center gap-1.5',
        config.className,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dotColor)} />
      {label || t(config.translationKey)}
    </Badge>
  );
}
