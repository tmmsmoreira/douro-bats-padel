'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

import {
  EventState,
  RSVPStatus as RSVPStatusEnum,
  PlayerStatus,
  InvitationStatus as InvitationStatusEnum,
} from '@padel/types';

// Accept both enum values and string literals for backward compatibility
export type EventStatus = EventState | `${EventState}`;
export type RSVPStatus = RSVPStatusEnum | `${RSVPStatusEnum}` | 'PARTICIPATED';
export type PlayerProfileStatus = PlayerStatus | `${PlayerStatus}`;
export type InvitationStatus = InvitationStatusEnum | `${InvitationStatusEnum}`;
export type Status = EventStatus | RSVPStatus | PlayerProfileStatus | InvitationStatus;

interface StatusBadgeProps {
  status: Status;
  className?: string;
  label?: string;
}

const statusConfig: Record<
  string,
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
  DECLINED: {
    variant: 'destructive',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
    dotColor: 'bg-destructive',
    translationKey: 'declined',
  },
  CANCELLED: {
    variant: 'secondary',
    className: 'bg-muted text-muted-foreground border-border',
    dotColor: 'bg-muted-foreground',
    translationKey: 'cancelled',
  },
  // Player profile statuses
  ACTIVE: {
    variant: 'default',
    className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
    dotColor: 'bg-green-500',
    translationKey: 'active',
  },
  INACTIVE: {
    variant: 'secondary',
    className: 'bg-muted text-muted-foreground border-border',
    dotColor: 'bg-muted-foreground',
    translationKey: 'inactive',
  },
  INVITED: {
    variant: 'outline',
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    dotColor: 'bg-blue-500',
    translationKey: 'invited',
  },
  // Invitation statuses
  PENDING: {
    variant: 'outline',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    dotColor: 'bg-amber-500',
    translationKey: 'pending',
  },
  ACCEPTED: {
    variant: 'default',
    className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
    dotColor: 'bg-green-500',
    translationKey: 'accepted',
  },
  REVOKED: {
    variant: 'destructive',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
    dotColor: 'bg-destructive',
    translationKey: 'revoked',
  },
  EXPIRED: {
    variant: 'secondary',
    className: 'bg-muted text-muted-foreground border-border',
    dotColor: 'bg-muted-foreground',
    translationKey: 'expired',
  },
};

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  const t = useTranslations('status');
  const config = statusConfig[status];

  if (!config) {
    console.warn(`No config found for status: ${status}`);
    return null;
  }

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
