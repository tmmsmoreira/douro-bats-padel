'use client';

import { useRef } from 'react';
import { UseMutationResult } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MoreVertical, Send, RefreshCw } from 'lucide-react';
import {
  LockIcon,
  LockIconHandle,
  SquarePenIcon,
  SquarePenIconHandle,
  DeleteIcon,
  DeleteIconHandle,
} from 'lucide-animated';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '../ui/spinner';

interface Draw {
  id: string;
  eventId: string;
}

interface EventActionsDropdownProps {
  event: {
    id: string;
    state: 'DRAFT' | 'OPEN' | 'FROZEN' | 'DRAWN' | 'PUBLISHED';
    endsAt: string;
  };
  draw: Draw | null;
  freezeMutation: UseMutationResult<unknown, Error, void, unknown>;
  unfreezeMutation: UseMutationResult<unknown, Error, void, unknown>;
  publishMutation: UseMutationResult<unknown, Error, void, unknown>;
  onDeleteClick: () => void;
}

export function EventActionsDropdown({
  event,
  draw,
  freezeMutation,
  unfreezeMutation,
  publishMutation,
  onDeleteClick,
}: EventActionsDropdownProps) {
  const t = useTranslations('eventDetails');
  const eventEndTime = new Date(event.endsAt);
  const hasEventPassed = eventEndTime < new Date();
  const deleteIconRef = useRef<DeleteIconHandle>(null);
  const squarePenIconRef = useRef<SquarePenIconHandle>(null);
  const lockIconRef = useRef<LockIconHandle>(null);

  // Allow editing if:
  // 1. Event hasn't passed yet, OR
  // 2. Event was never published (state is DRAFT, OPEN, or FROZEN), OR
  // 3. Event was never drawn (state is DRAFT, OPEN, or FROZEN)
  const canEdit =
    !hasEventPassed ||
    event.state === 'DRAFT' ||
    event.state === 'OPEN' ||
    event.state === 'FROZEN';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0" animate={false}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Primary Actions */}
        {!hasEventPassed && (
          <>
            {event.state === 'DRAFT' && (
              <DropdownMenuItem
                onClick={() => publishMutation.mutate()}
                disabled={publishMutation.isPending}
                className="gap-2"
              >
                {publishMutation.isPending && (
                  <Spinner data-icon="inline-start" className="h-4 w-4" />
                )}
                <Send className="h-4 w-4" />
                <span>{publishMutation.isPending ? t('publishing') : t('publishEvent')}</span>
              </DropdownMenuItem>
            )}
            {event.state === 'OPEN' && (
              <DropdownMenuItem
                onClick={() => freezeMutation.mutate()}
                disabled={freezeMutation.isPending}
                className="gap-2"
              >
                {freezeMutation.isPending && (
                  <Spinner data-icon="inline-start" className="h-4 w-4" />
                )}
                <LockIcon size={16} className="h-4 w-4" />
                <span>{freezeMutation.isPending ? t('freezing') : t('freezeRsvps')}</span>
              </DropdownMenuItem>
            )}
            {event.state === 'FROZEN' && !draw && (
              <DropdownMenuItem asChild>
                <Link href={`/admin/events/${event.id}/draw`} className="flex gap-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>{t('generateDraw')}</span>
                </Link>
              </DropdownMenuItem>
            )}
            {(event.state === 'FROZEN' || event.state === 'DRAWN' || event.state === 'PUBLISHED') &&
              draw && (
                <DropdownMenuItem asChild>
                  <Link href={`/admin/events/${event.id}/draw`} className="flex gap-2">
                    <RefreshCw className="h-4 w-4" />
                    <span>{t('viewEditDraw')}</span>
                  </Link>
                </DropdownMenuItem>
              )}
          </>
        )}

        {/* Secondary Actions */}
        {canEdit && (
          <>
            <DropdownMenuSeparator />
            {event.state === 'FROZEN' && !draw && (
              <DropdownMenuItem
                onClick={() => unfreezeMutation.mutate()}
                disabled={unfreezeMutation.isPending}
                className="gap-2"
                onMouseEnter={() => lockIconRef.current?.startAnimation()}
                onMouseLeave={() => lockIconRef.current?.stopAnimation()}
              >
                {unfreezeMutation.isPending && (
                  <Spinner data-icon="inline-start" className="h-4 w-4" />
                )}
                <LockIcon ref={lockIconRef} size={16} className="h-4 w-4" />
                <span>{unfreezeMutation.isPending ? t('unfreezing') : t('unfreezeEvent')}</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              asChild
              onMouseEnter={() => squarePenIconRef.current?.startAnimation()}
              onMouseLeave={() => squarePenIconRef.current?.stopAnimation()}
            >
              <Link href={`/admin/events/${event.id}/edit`} className="flex gap-2">
                <SquarePenIcon ref={squarePenIconRef} size={16} className="h-4 w-4" />
                <span>{t('editEvent')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Delete Action */}
        <DropdownMenuItem
          variant="destructive"
          onClick={onDeleteClick}
          className="gap-2"
          onMouseEnter={() => deleteIconRef.current?.startAnimation()}
          onMouseLeave={() => deleteIconRef.current?.stopAnimation()}
        >
          <DeleteIcon ref={deleteIconRef} size={16} className="h-4 w-4" />
          <span>{t('deleteEvent')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
