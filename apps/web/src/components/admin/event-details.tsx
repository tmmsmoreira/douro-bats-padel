'use client';

import { useQuery, useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import { LockIcon, LockIconHandle, SquarePenIcon, SquarePenIconHandle } from 'lucide-animated';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { PageHeader } from '../shared/page-header';
import { DeleteIcon, DeleteIconHandle } from 'lucide-animated';
import { DataStateWrapper } from '../shared';
import { EventHeaderInfo, ConfirmedPlayersSection } from '../shared/event';
import { Spinner } from '../ui/spinner';
import { TierSection, WaitlistSection } from '@/components/shared/draw';
import type { Player, WaitlistedPlayer, Assignment } from '@/components/shared/draw';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Draw {
  id: string;
  eventId: string;
  assignments: Assignment[];
  event?: {
    tierRules?: {
      mastersTimeSlot?: {
        startsAt: string;
        endsAt: string;
      };
      explorersTimeSlot?: {
        startsAt: string;
        endsAt: string;
      };
    };
  };
}

interface EventDetails {
  id: string;
  title: string | null;
  date: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  state: 'DRAFT' | 'OPEN' | 'FROZEN' | 'DRAWN' | 'PUBLISHED';
  venue?: {
    id: string;
    name: string;
  };
  confirmedCount: number;
  waitlistCount: number;
  confirmedPlayers?: Player[];
  waitlistedPlayers?: WaitlistedPlayer[];
}

export function EventDetails({ eventId }: { eventId: string }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations('eventDetails');
  const locale = useLocale();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: event, isLoading } = useQuery<EventDetails>({
    queryKey: ['event', eventId, session?.accessToken],
    queryFn: async () => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }

      // Add includeUnpublished=true query parameter for admin view
      const res = await fetch(`${API_URL}/events/${eventId}?includeUnpublished=true`, { headers });

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
      }

      return res.json();
    },
  });

  // Fetch draw if event has one
  const { data: draw } = useQuery({
    queryKey: ['draw', eventId, session?.accessToken],
    queryFn: async () => {
      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (session?.accessToken) {
          headers.Authorization = `Bearer ${session.accessToken}`;
        }
        const res = await fetch(`${API_URL}/draws/events/${eventId}`, { headers });
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    },
    enabled:
      !!session?.accessToken &&
      (event?.state === 'FROZEN' || event?.state === 'DRAWN' || event?.state === 'PUBLISHED'),
  });

  const freezeMutation = useMutation({
    mutationFn: async () => {
      if (!session?.accessToken) {
        throw new Error('Not authenticated');
      }

      const res = await fetch(`${API_URL}/events/${eventId}/freeze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${res.statusText}`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      toast.success(t('freezeSuccess') || 'Event RSVPs frozen successfully');
    },
    onError: (error: Error) => {
      toast.error(t('freezeError') + ': ' + error.message);
    },
  });

  const unfreezeMutation = useMutation({
    mutationFn: async () => {
      if (!session?.accessToken) {
        throw new Error('Not authenticated');
      }

      const res = await fetch(`${API_URL}/events/${eventId}/unfreeze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || `API Error: ${res.statusText}`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      toast.success(t('unfreezeSuccess') || 'Event reopened successfully');
    },
    onError: (error: Error) => {
      toast.error(t('unfreezeError') + ': ' + error.message);
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!session?.accessToken) {
        throw new Error('Not authenticated');
      }

      const res = await fetch(`${API_URL}/events/${eventId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!session?.accessToken) {
        throw new Error('Not authenticated');
      }

      const res = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || 'Failed to delete event');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast.success(t('deleteSuccess') || 'Event deleted successfully');
      router.push('/admin');
    },
    onError: (error: Error) => {
      toast.error(t('deleteError') + ': ' + error.message);
    },
  });

  return (
    <DataStateWrapper
      isLoading={isLoading}
      data={event}
      loadingMessage={t('loadingEvent')}
      emptyMessage={t('eventNotFound')}
    >
      {(event) => (
        <EventDetailsContent
          event={event}
          draw={draw}
          freezeMutation={freezeMutation}
          unfreezeMutation={unfreezeMutation}
          publishMutation={publishMutation}
          deleteMutation={deleteMutation}
          showDeleteDialog={showDeleteDialog}
          setShowDeleteDialog={setShowDeleteDialog}
          locale={locale}
          t={t}
        />
      )}
    </DataStateWrapper>
  );
}

// Separate component for event details content
function EventDetailsContent({
  event,
  draw,
  freezeMutation,
  unfreezeMutation,
  publishMutation,
  deleteMutation,
  showDeleteDialog,
  setShowDeleteDialog,
  locale,
  t,
}: {
  event: EventDetails;
  draw: Draw | null;
  freezeMutation: any;
  unfreezeMutation: any;
  publishMutation: any;
  deleteMutation: any;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  locale: string;
  t: any;
}) {
  return (
    <div className="space-y-8">
      <PageHeader
        title={event.title || t('untitledEvent')}
        description={<EventHeaderInfo event={event} locale={locale} />}
        showBackButton
        backButtonHref="/admin"
        backButtonLabel={t('backToEvents')}
        action={
          <EventDetailsHeaderActionButtons
            event={event}
            freezeMutation={freezeMutation}
            unfreezeMutation={unfreezeMutation}
            publishMutation={publishMutation}
            draw={draw}
            onDeleteClick={() => setShowDeleteDialog(true)}
          />
        }
      />

      <div className="space-y-4">
        {/* Show draw if it exists, otherwise show confirmed players */}
        {draw ? (
          <div className="space-y-6">
            <DrawSummary draw={draw} />

            {/* Always show waitlist if there are waitlisted players */}
            {(event.waitlistCount > 0 || (event.waitlistedPlayers?.length ?? 0) > 0) && (
              <WaitlistSection
                players={event.waitlistedPlayers || []}
                showAvatar={true}
                title={`${t('waitlist')} (${event.waitlistCount || event.waitlistedPlayers?.length || 0})`}
              />
            )}
          </div>
        ) : (
          <div
            className={cn('grid gap-6', `md:grid-cols-${event.waitlistedPlayers?.length ? 2 : 1}`)}
          >
            <ConfirmedPlayersSection
              players={event.confirmedPlayers || []}
              confirmedCount={event.confirmedCount}
              capacity={event.capacity}
              title={t('confirmedPlayers')}
              spotsRemainingText={t('spotsRemaining', {
                count: event.capacity - event.confirmedCount,
              })}
              showAvatar={true}
              showIndex={true}
            />

            <WaitlistSection
              players={event.waitlistedPlayers || []}
              showAvatar={true}
              title={`${t('waitlist')} (${event.waitlistCount})`}
            />
          </div>
        )}

        {/* Delete Event Confirmation Dialog */}
        <ConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title={t('deleteConfirmation')}
          description={t('deleteConfirmationDescription')}
          confirmText={t('deleteEvent')}
          confirmingText={t('deleting')}
          cancelText={t('cancel')}
          variant="destructive"
          isLoading={deleteMutation.isPending}
          onConfirm={() => {
            deleteMutation.mutate();
          }}
        />
      </div>
    </div>
  );
}

// Draw Summary Component
function DrawSummary({ draw }: { draw: Draw }) {
  const t = useTranslations('eventDetails');

  // Group assignments by tier and round
  const masterAssignments = draw.assignments?.filter((a) => a.tier === 'MASTERS') || [];
  const explorerAssignments = draw.assignments?.filter((a) => a.tier === 'EXPLORERS') || [];

  const mastersRounds: Record<number, Assignment[]> = {};
  masterAssignments.forEach((assignment) => {
    if (!mastersRounds[assignment.round]) {
      mastersRounds[assignment.round] = [];
    }
    mastersRounds[assignment.round].push(assignment);
  });

  const explorersRounds: Record<number, Assignment[]> = {};
  explorerAssignments.forEach((assignment) => {
    if (!explorersRounds[assignment.round]) {
      explorersRounds[assignment.round] = [];
    }
    explorersRounds[assignment.round].push(assignment);
  });

  return (
    <div className="space-y-6">
      {/* Masters Draw */}
      <TierSection
        tier="MASTERS"
        rounds={mastersRounds}
        timeSlot={draw.event?.tierRules?.mastersTimeSlot}
        translations={{
          tierName: t('masters'),
          round: (round) => t('round', { round }),
          courtLabel: (courtId) => `Court ${courtId}`,
        }}
      />

      {/* Explorers Draw */}
      <TierSection
        tier="EXPLORERS"
        rounds={explorersRounds}
        timeSlot={draw.event?.tierRules?.explorersTimeSlot}
        translations={{
          tierName: t('explorers'),
          round: (round) => t('round', { round }),
          courtLabel: (courtId) => `Court ${courtId}`,
        }}
      />
    </div>
  );
}

function EventDetailsHeaderActionButtons({
  event,
  freezeMutation,
  unfreezeMutation,
  publishMutation,
  draw,
  onDeleteClick,
}: {
  event: EventDetails;
  freezeMutation: UseMutationResult<any, Error, void, unknown>;
  unfreezeMutation: UseMutationResult<any, Error, void, unknown>;
  publishMutation: UseMutationResult<any, Error, void, unknown>;
  draw: Draw | null;
  onDeleteClick: () => void;
}) {
  const t = useTranslations('eventDetails');
  const eventEndTime = new Date(event.endsAt);
  const hasEventPassed = eventEndTime < new Date();
  const deleteIconRef = useRef<DeleteIconHandle>(null);
  const squarePenIconRef = useRef<SquarePenIconHandle>(null);
  const lockIconRef = useRef<LockIconHandle>(null);

  // Determine the primary action based on event state
  const getPrimaryAction = () => {
    if (hasEventPassed && event.state === 'PUBLISHED') {
      return (
        <Link href={`/admin/events/${event.id}/results`}>
          <Button variant="secondary" animate className="w-full">
            {t('enterResults')}
          </Button>
        </Link>
      );
    }

    if (!hasEventPassed) {
      switch (event.state) {
        case 'DRAFT':
          return (
            <Button
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending}
              className="w-full gap-2"
            >
              {publishMutation.isPending && (
                <Spinner data-icon="inline-start" className="h-4 w-4" />
              )}
              {publishMutation.isPending ? t('publishing') : t('publishEvent')}
            </Button>
          );
        case 'OPEN':
          return (
            <LoadingButton
              onClick={() => freezeMutation.mutate()}
              isLoading={freezeMutation.isPending}
              loadingText={t('freezing')}
              className="w-full gap-2"
            >
              {t('freezeRsvps')}
            </LoadingButton>
          );
        case 'FROZEN':
          if (!draw) {
            return (
              <Link href={`/admin/events/${event.id}/draw`} className="w-full">
                <Button className="w-full">{t('generateDraw')}</Button>
              </Link>
            );
          }
          return (
            <Link href={`/admin/events/${event.id}/draw/view`} className="w-full">
              <Button variant="outline" className="w-full">
                {t('viewEditDraw')}
              </Button>
            </Link>
          );
        case 'DRAWN':
        case 'PUBLISHED':
          return (
            <Link href={`/admin/events/${event.id}/draw/view`} className="w-full">
              <Button variant="outline" className="w-full">
                {t('viewEditDraw')}
              </Button>
            </Link>
          );
      }
    }

    return null;
  };

  return (
    <div className="flex gap-2 w-full sm:w-auto">
      <div className="flex-1 sm:flex-initial">{getPrimaryAction()}</div>

      {/* More Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0" animate={false}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {(event.state === 'DRAFT' || !hasEventPassed) && (
            <>
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
          <DropdownMenuItem
            variant="destructive"
            onClick={onDeleteClick}
            className="flex gap-2"
            onMouseEnter={() => deleteIconRef.current?.startAnimation()}
            onMouseLeave={() => deleteIconRef.current?.stopAnimation()}
          >
            <DeleteIcon ref={deleteIconRef} size={16} className="h-4 w-4" />
            <span>{t('deleteEvent')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
