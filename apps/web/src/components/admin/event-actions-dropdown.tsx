'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import {
  LockIcon,
  LockIconHandle,
  SquarePenIcon,
  SquarePenIconHandle,
  DeleteIcon,
  DeleteIconHandle,
  XIcon,
  XIconHandle,
  ArchiveIcon,
  ArchiveIconHandle,
  RefreshCwIcon,
  RefreshCwIconHandle,
} from 'lucide-animated';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '../ui/spinner';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import {
  useFreezeEvent,
  useUnfreezeEvent,
  usePublishEvent,
  useDeleteEvent,
} from '@/hooks/use-events';
import { usePublishDraw, useUnpublishDraw, useDeleteDraw } from '@/hooks/use-draws';
import { SendIcon } from '../icons';
import { SendIconHandle } from '../icons/send-icon';

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
  onDeleteSuccess: () => void;
}

export function EventActionsDropdown({ event, draw, onDeleteSuccess }: EventActionsDropdownProps) {
  const t = useTranslations('eventDetails');
  const tDraw = useTranslations('adminDrawView');
  const [showDeleteDrawDialog, setShowDeleteDrawDialog] = useState(false);
  const [showDeleteEventDialog, setShowDeleteEventDialog] = useState(false);

  const eventEndTime = new Date(event.endsAt);
  const hasEventPassed = eventEndTime < new Date();
  const deleteIconRef = useRef<DeleteIconHandle>(null);
  const squarePenIconRef = useRef<SquarePenIconHandle>(null);
  const lockIconRef = useRef<LockIconHandle>(null);
  const sendIconRef = useRef<SendIconHandle>(null);
  const xIconRef = useRef<XIconHandle>(null);
  const archiveIconRef = useRef<ArchiveIconHandle>(null);
  const refreshCwIconRef = useRef<RefreshCwIconHandle>(null);

  // Event mutations
  const freezeMutation = useFreezeEvent(event.id);
  const unfreezeMutation = useUnfreezeEvent(event.id);
  const publishMutation = usePublishEvent(event.id);
  const deleteEventMutation = useDeleteEvent(event.id, onDeleteSuccess);

  // Draw mutations
  const publishDrawMutation = usePublishDraw(event.id);
  const unpublishDrawMutation = useUnpublishDraw(event.id);
  const deleteDrawMutation = useDeleteDraw(event.id);

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
    <>
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
                  onMouseEnter={() => sendIconRef.current?.startAnimation()}
                  onMouseLeave={() => sendIconRef.current?.stopAnimation()}
                >
                  {publishMutation.isPending && (
                    <Spinner data-icon="inline-start" className="h-4 w-4" />
                  )}
                  <SendIcon ref={sendIconRef} className="h-4 w-4" />
                  <span>{publishMutation.isPending ? t('publishing') : t('publishEvent')}</span>
                </DropdownMenuItem>
              )}
              {event.state === 'OPEN' && (
                <DropdownMenuItem
                  onClick={() => freezeMutation.mutate()}
                  disabled={freezeMutation.isPending}
                  className="gap-2"
                  onMouseEnter={() => lockIconRef.current?.startAnimation()}
                  onMouseLeave={() => lockIconRef.current?.stopAnimation()}
                >
                  {freezeMutation.isPending && (
                    <Spinner data-icon="inline-start" className="h-4 w-4" />
                  )}
                  <LockIcon size={16} className="h-4 w-4" />
                  <span>{freezeMutation.isPending ? t('freezing') : t('freezeRsvps')}</span>
                </DropdownMenuItem>
              )}
              {event.state === 'FROZEN' && !draw && (
                <DropdownMenuItem
                  asChild
                  onMouseEnter={() => refreshCwIconRef.current?.startAnimation()}
                  onMouseLeave={() => refreshCwIconRef.current?.stopAnimation()}
                >
                  <Link href={`/admin/events/${event.id}/draw`} className="flex gap-2">
                    <RefreshCwIcon ref={refreshCwIconRef} className="h-4 w-4" />
                    <span>{t('generateDraw')}</span>
                  </Link>
                </DropdownMenuItem>
              )}

              {draw && <DropdownMenuLabel>{tDraw('draw')}</DropdownMenuLabel>}

              {/* Draw Actions - Only show if draw exists and event hasn't passed */}
              {draw && event.state === 'DRAWN' && (
                <DropdownMenuItem
                  onClick={() => publishDrawMutation.mutate()}
                  disabled={publishDrawMutation.isPending}
                  className="gap-2"
                  onMouseEnter={() => sendIconRef.current?.startAnimation()}
                  onMouseLeave={() => sendIconRef.current?.stopAnimation()}
                >
                  {publishDrawMutation.isPending && (
                    <Spinner data-icon="inline-start" className="h-4 w-4" />
                  )}
                  <SendIcon ref={sendIconRef} className="h-4 w-4" />
                  <span>
                    {publishDrawMutation.isPending ? tDraw('publishing') : tDraw('publish')}
                  </span>
                </DropdownMenuItem>
              )}
              {draw && event.state === 'PUBLISHED' && (
                <DropdownMenuItem
                  onClick={() => unpublishDrawMutation.mutate()}
                  disabled={unpublishDrawMutation.isPending}
                  className="gap-2"
                  onMouseEnter={() => archiveIconRef.current?.startAnimation()}
                  onMouseLeave={() => archiveIconRef.current?.stopAnimation()}
                >
                  {unpublishDrawMutation.isPending && (
                    <Spinner data-icon="inline-start" className="h-4 w-4" />
                  )}
                  <ArchiveIcon ref={archiveIconRef} className="h-4 w-4" />
                  <span>
                    {unpublishDrawMutation.isPending ? tDraw('unpublishing') : tDraw('unpublish')}
                  </span>
                </DropdownMenuItem>
              )}
              {draw && (event.state === 'DRAWN' || event.state === 'PUBLISHED') && (
                <DropdownMenuItem
                  onClick={() => setShowDeleteDrawDialog(true)}
                  disabled={deleteDrawMutation.isPending}
                  className="gap-2"
                  onMouseEnter={() => xIconRef.current?.startAnimation()}
                  onMouseLeave={() => xIconRef.current?.stopAnimation()}
                >
                  <XIcon ref={xIconRef} className="h-4 w-4" />
                  <span>
                    {deleteDrawMutation.isPending ? tDraw('deleting') : tDraw('deleteDraw')}
                  </span>
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

          {/* Delete Event Action */}
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setShowDeleteEventDialog(true)}
            className="gap-2"
            onMouseEnter={() => deleteIconRef.current?.startAnimation()}
            onMouseLeave={() => deleteIconRef.current?.stopAnimation()}
          >
            <DeleteIcon ref={deleteIconRef} size={16} className="h-4 w-4" />
            <span>{t('deleteEvent')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Draw Confirmation Dialog */}
      {draw && (
        <ConfirmationDialog
          open={showDeleteDrawDialog}
          onOpenChange={setShowDeleteDrawDialog}
          title={tDraw('deleteDrawTitle')}
          description={tDraw('deleteDrawDescription')}
          confirmText={tDraw('deleteDraw')}
          cancelText={tDraw('cancel')}
          variant="destructive"
          isLoading={deleteDrawMutation.isPending}
          onConfirm={() => {
            deleteDrawMutation.mutate();
            setShowDeleteDrawDialog(false);
          }}
        />
      )}

      {/* Delete Event Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteEventDialog}
        onOpenChange={setShowDeleteEventDialog}
        title={t('deleteEventTitle')}
        description={t('deleteEventDescription')}
        confirmText={t('deleteEvent')}
        cancelText={t('cancel')}
        variant="destructive"
        isLoading={deleteEventMutation.isPending}
        onConfirm={() => {
          deleteEventMutation.mutate();
          setShowDeleteEventDialog(false);
        }}
      />
    </>
  );
}
