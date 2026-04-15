'use client';

import { UseMutationResult } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { DataStateWrapper } from '../shared';
import { ConfirmedPlayersSection } from '../shared/event';
import { WaitlistSection } from '@/components/shared/draw';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatTimeSlot } from '@/lib/utils';
import { useRemovePlayerFromEvent, useEventDetails, useIsFromBfcache } from '@/hooks';
import type { EventWithPlayersSerialized } from '@padel/types';

export function EventDetails({ eventId }: { eventId: string }) {
  const t = useTranslations('eventDetails');

  const { data: event, isLoading, error } = useEventDetails(eventId);

  // Use custom hook for removing players
  const removePlayerMutation = useRemovePlayerFromEvent(eventId);

  return (
    <DataStateWrapper
      isLoading={isLoading}
      data={event}
      error={error}
      loadingMessage={t('loadingEvent')}
      emptyMessage={t('eventNotFound')}
      errorMessage={t('errorLoadingEvent')}
    >
      {(event) => (
        <EventDetailsContent event={event} removePlayerMutation={removePlayerMutation} t={t} />
      )}
    </DataStateWrapper>
  );
}

// Separate component for event details content
function EventDetailsContent({
  event,
  removePlayerMutation,
  t,
}: {
  event: EventWithPlayersSerialized;
  removePlayerMutation: UseMutationResult<unknown, Error, string, unknown>;
  t: ReturnType<typeof useTranslations>;
}) {
  const locale = useLocale();
  const isBackNav = useIsFromBfcache();
  const [playerToRemove, setPlayerToRemove] = useState<{ id: string; name: string } | null>(null);

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
      className="space-y-8"
    >
      <div className="space-y-4">
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
                    {formatTimeSlot(event.tierRules.explorersTimeSlot.startsAt, event.date, locale)}{' '}
                    - {formatTimeSlot(event.tierRules.explorersTimeSlot.endsAt, event.date, locale)}
                  </span>
                </Badge>
              )}
            </div>
          )}

        {/* Always show confirmed players and waitlist in the Details tab */}
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

        {/* Remove Player Confirmation Dialog */}
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
      </div>
    </motion.div>
  );
}
