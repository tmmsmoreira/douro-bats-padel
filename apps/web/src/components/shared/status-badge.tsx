import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type EventStatus = 'DRAFT' | 'OPEN' | 'FROZEN' | 'DRAWN' | 'PUBLISHED';

interface StatusBadgeProps {
  status: EventStatus;
  className?: string;
}

const statusConfig: Record<
  EventStatus,
  {
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
    className: string;
    dotColor: string;
    label: string;
  }
> = {
  DRAFT: {
    variant: 'outline',
    className: 'border-warning/30 text-warning bg-warning/10',
    dotColor: 'bg-warning',
    label: 'DRAFT',
  },
  OPEN: {
    variant: 'default',
    className: 'bg-secondary/10 text-secondary border-secondary/30',
    dotColor: 'bg-secondary',
    label: 'OPEN',
  },
  FROZEN: {
    variant: 'secondary',
    className: 'bg-muted text-muted-foreground border-border',
    dotColor: 'bg-muted-foreground',
    label: 'FROZEN',
  },
  DRAWN: {
    variant: 'secondary',
    className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    dotColor: 'bg-purple-500',
    label: 'DRAWN',
  },
  PUBLISHED: {
    variant: 'default',
    className: 'bg-primary/10 text-primary border-primary/30',
    dotColor: 'bg-primary',
    label: 'PUBLISHED',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
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
      {config.label}
    </Badge>
  );
}
