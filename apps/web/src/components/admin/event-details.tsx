'use client';

import { useQuery, UseMutationResult } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { motion } from 'motion/react';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { DataStateWrapper } from '../shared';
import { ConfirmedPlayersSection } from '../shared/event';
import { WaitlistSection } from '@/components/shared/draw';
import type { Player, WaitlistedPlayer } from '@/components/shared/draw';
import { cn } from '@/lib/utils';
import { useRemovePlayerFromEvent } from '@/hooks/use-events';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  const t = useTranslations('eventDetails');

  const {
    data: event,
    isLoading,
    error,
  } = useQuery<EventDetails>({
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
    // Retry a few times with exponential backoff to handle transient errors
    // (e.g., database replication lag after event creation)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(300 * 2 ** attemptIndex, 1000),
  });

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
  event: EventDetails;
  removePlayerMutation: UseMutationResult<unknown, Error, string, unknown>;
  t: ReturnType<typeof useTranslations>;
}) {
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="space-y-4">
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
