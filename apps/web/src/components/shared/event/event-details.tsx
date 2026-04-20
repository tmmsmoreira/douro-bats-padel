'use client';

import { UseMutationResult } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { StatusBadge, DataStateWrapper } from '@/components/shared';
import { ConfirmedPlayersSection } from '@/components/shared/event';
import { EventDetailsSkeleton } from '@/components/shared/event/event-skeletons';
import { WaitlistSection } from '@/components/shared/draw';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { formatTimeSlot } from '@/lib/utils';
import { useRSVP, useRemovePlayerFromEvent, useEventDetails, useIsFromBfcache } from '@/hooks';
import type { EventWithPlayersSerialized } from '@padel/types';

interface EventDetailsProps {
  eventId: string;
  isEditor?: boolean;
}

export function EventDetails({ eventId, isEditor = false }: EventDetailsProps) {
  const t = useTranslations('eventDetails');
  const locale = useLocale();

  const { data: event, isLoading, error } = useEventDetails(eventId);
  const removePlayerMutation = useRemovePlayerFromEvent(eventId);

  return (
    <DataStateWrapper
      isLoading={isLoading}
      data={event}
      error={error}
      loadingMessage={t('loadingEvent')}
      loadingComponent={<EventDetailsSkeleton />}
      emptyMessage={t('eventNotFound')}
      errorMessage={isEditor ? t('errorLoadingEvent') : undefined}
    >
      {(event) => (
        <EventDetailsContent
          event={event}
          locale={locale}
          isEditor={isEditor}
          removePlayerMutation={removePlayerMutation}
          t={t}
        />
      )}
    </DataStateWrapper>
  );
}

function EventDetailsContent({
  event,
  locale,
  isEditor,
  removePlayerMutation,
  t,
}: {
  event: EventWithPlayersSerialized;
  locale: string;
  isEditor: boolean;
  removePlayerMutation: UseMutationResult<unknown, Error, string, unknown>;
  t: ReturnType<typeof useTranslations>;
}) {
  const { data: session } = useSession();
  const isBackNav = useIsFromBfcache();
  const rsvpMutation = useRSVP([['event', event.id]]);
  const [playerToRemove, setPlayerToRemove] = useState<{ id: string; name: string } | null>(null);

  // Player RSVP state
  const userStatus = event.userRSVP?.status;
  const isConfirmed = userStatus === 'CONFIRMED';
  const isWaitlisted = userStatus === 'WAITLISTED';
  const isFull = event.confirmedCount >= event.capacity;
  const now = new Date();
  const rsvpOpens = new Date(event.rsvpOpensAt);
  const rsvpCloses = new Date(event.rsvpClosesAt);
  const eventDate = new Date(event.date);
  const isPastEvent = eventDate < now;
  const canRegister = !!(session && now >= rsvpOpens && now <= rsvpCloses && !isPastEvent);
  const spotsRemaining = event.capacity - event.confirmedCount;

  const handleRSVP = (status: 'IN' | 'OUT') => {
    rsvpMutation.mutate({ eventId: event.id, status });
  };

  // Editor: remove player
  const handleRemovePlayer = (playerId: string) => {
    const player =
      event.confirmedPlayers?.find((p) => p.id === playerId) ||
      event.waitlistedPlayers?.find((p) => p.id === playerId);
    if (player) {
      setPlayerToRemove({ id: player.id, name: player.name });
    }
  };

  const confirmRemovePlayer = () => {
    if (playerToRemove) {
      removePlayerMutation.mutate(playerToRemove.id);
      setPlayerToRemove(null);
    }
  };

  return (
    <motion.div
      initial={isBackNav ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: isBackNav ? 0 : 0.3 }}
      className="space-y-6"
    >
      {/* RSVP Card - For all authenticated users on non-past, non-draft events */}
      {session && !isPastEvent && event.state !== 'DRAFT' && (
        <Card className="glass-card">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{t('registrationTitle')}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{t('registrationDescription')}</p>
              </div>
              <div className="flex flex-wrap gap-4">
                {canRegister && !isConfirmed && !isWaitlisted && (
                  <Button
                    onClick={() => handleRSVP('IN')}
                    disabled={rsvpMutation.isPending}
                    className="w-full gap-2"
                    animate
                  >
                    {rsvpMutation.isPending && (
                      <Spinner data-icon="inline-start" className="h-4 w-4" />
                    )}
                    {isFull ? t('registerToWaitlist') : t('register')}
                  </Button>
                )}
                {(isConfirmed || isWaitlisted) && (
                  <>
                    <div className="flex items-center gap-2">
                      {isConfirmed && (
                        <StatusBadge status="CONFIRMED" label={t('confirmedBadge')} />
                      )}
                      {isWaitlisted && (
                        <StatusBadge
                          status="WAITLISTED"
                          label={t('waitlistedPosition', {
                            position: event.userRSVP?.position || 0,
                          })}
                        />
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleRSVP('OUT')}
                      disabled={rsvpMutation.isPending}
                      className="w-full sm:w-auto gap-2"
                      animate
                    >
                      {rsvpMutation.isPending && (
                        <Spinner data-icon="inline-start" className="h-4 w-4" />
                      )}
                      {t('unregister')}
                    </Button>
                  </>
                )}
                {!canRegister && !isConfirmed && !isWaitlisted && (
                  <div className="w-full sm:w-auto text-sm text-muted-foreground text-center py-4 sm:py-0">
                    <p className="text-xs">
                      {now < rsvpOpens ? t('rsvpNotOpenYet') : t('rsvpClosed')}
                    </p>
                    {now < rsvpOpens && (
                      <p className="mt-1 flex items-center justify-center gap-1 text-xs font-medium">
                        <Clock className="h-3 w-3" />
                        {t('rsvpOpensOn', {
                          date: rsvpOpens.toLocaleString(locale, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }),
                        })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Tier Time Slots */}
      {event.tierRules &&
        (event.tierRules.mastersTimeSlot || event.tierRules.explorersTimeSlot) && (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {event.tierRules.mastersTimeSlot && (
              <Badge variant="outline" className="text-sm px-3 py-1 bg-white dark:bg-white/5">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1" />
                <span className="font-semibold font-heading uppercase">{t('masters')}</span>
                <Clock className="ml-1.5 h-3 w-3 text-muted-foreground" />
                <span>
                  {formatTimeSlot(event.tierRules.mastersTimeSlot.startsAt, event.date, locale)} -{' '}
                  {formatTimeSlot(event.tierRules.mastersTimeSlot.endsAt, event.date, locale)}
                </span>
              </Badge>
            )}
            {event.tierRules.explorersTimeSlot && (
              <Badge variant="outline" className="text-sm px-3 py-1 bg-white dark:bg-white/5">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                <span className="font-semibold font-heading uppercase">{t('explorers')}</span>
                <Clock className="ml-1.5 h-3 w-3 text-muted-foreground" />
                <span>
                  {formatTimeSlot(event.tierRules.explorersTimeSlot.startsAt, event.date, locale)} -{' '}
                  {formatTimeSlot(event.tierRules.explorersTimeSlot.endsAt, event.date, locale)}
                </span>
              </Badge>
            )}
          </div>
        )}

      {/* Players sections */}
      {isEditor ? (
        /* Editor: 2-column grid with remove capability */
        <div
          className={cn('grid gap-6', `md:grid-cols-${event.waitlistedPlayers?.length ? 2 : 1}`)}
        >
          <ConfirmedPlayersSection
            players={event.confirmedPlayers || []}
            confirmedCount={event.confirmedCount}
            capacity={event.capacity}
            title={t('confirmedPlayers')}
            spotsRemainingText={t('spotsRemaining', {
              count: spotsRemaining,
            })}
            showAvatar={true}
            showIndex={true}
            onRemovePlayer={handleRemovePlayer}
            isRemoving={removePlayerMutation.isPending}
            showDeleteAction={true}
          />
          <WaitlistSection
            players={event.waitlistedPlayers || []}
            showAvatar={true}
            title={`${t('waitlist')} (${event.waitlistCount})`}
            onRemovePlayer={handleRemovePlayer}
            isRemoving={removePlayerMutation.isPending}
            showDeleteAction={true}
          />
        </div>
      ) : (
        /* Viewer: stacked layout with capacity info */
        <>
          <ConfirmedPlayersSection
            players={event.confirmedPlayers || []}
            confirmedCount={event.confirmedCount}
            capacity={event.capacity}
            title={t('confirmedPlayers')}
            spotsRemainingText={t('spotsRemaining', { count: spotsRemaining })}
            showAvatar={true}
            showIndex={true}
            showCapacityBadge={true}
            capacityBadgeText={t('spotsRemaining', { count: spotsRemaining })}
            fullCapacityText={t('fullCapacity')}
            emptyMessage={t('noConfirmedPlayers')}
            canRegister={canRegister}
          />
          {event.waitlistedPlayers && event.waitlistedPlayers.length > 0 && (
            <WaitlistSection
              players={event.waitlistedPlayers}
              showAvatar={true}
              avatarSize="md"
              title={`${t('waitlist')} (${event.waitlistCount})`}
            />
          )}
        </>
      )}

      {/* Editor: Remove Player Confirmation Dialog */}
      {isEditor && (
        <ConfirmationDialog
          open={!!playerToRemove}
          onOpenChange={(open) => !open && setPlayerToRemove(null)}
          title={t('removePlayerConfirmation')}
          description={t('removePlayerConfirmationDescription', {
            playerName: playerToRemove?.name || '',
          })}
          confirmText={t('removePlayer')}
          confirmingText={t('removingPlayer')}
          cancelText={t('cancel')}
          variant="destructive"
          isLoading={removePlayerMutation.isPending}
          onConfirm={confirmRemovePlayer}
        />
      )}
    </motion.div>
  );
}
