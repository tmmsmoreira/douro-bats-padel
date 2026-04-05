'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { DataStateWrapper } from '@/components/shared';
import { TierSection, WaitlistSection } from '@/components/shared/draw';
import type { Draw, Assignment } from '@/components/shared/draw';
import type { EventWithRSVP } from '@padel/types';
import { BadgeAlertIcon } from 'lucide-animated';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function DrawView({ eventId }: { eventId: string }) {
  const { data: session } = useSession();
  const t = useTranslations('drawView');

  const {
    data: draw,
    isLoading,
    error,
  } = useQuery<Draw>({
    queryKey: ['draw', eventId],
    queryFn: async () => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }
      const res = await fetch(`${API_URL}/draws/events/${eventId}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch draw');
      return res.json();
    },
    retry: false, // Don't retry if draw doesn't exist
    enabled: !!session, // Only run query when session is available
  });

  // Fetch event data to get waitlist
  const { data: event } = useQuery<EventWithRSVP | null>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }
      const res = await fetch(`${API_URL}/events/${eventId}`, { headers });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!session,
  });

  return (
    <DataStateWrapper
      isLoading={isLoading}
      data={draw}
      error={error}
      loadingMessage={t('loadingDraw')}
      errorComponent={
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BadgeAlertIcon className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{t('drawNotAvailable')}</EmptyTitle>
            <EmptyDescription>
              {t('drawNotAvailableDescription')}
              {error && (
                <>
                  <br />
                  <span className="text-xs text-destructive mt-2 block">
                    {t('error')}: {error instanceof Error ? error.message : 'Failed to load draw'}
                  </span>
                </>
              )}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      }
      emptyMessage={t('drawNotAvailable')}
    >
      {(draw) => <DrawContent draw={draw} event={event} t={t} />}
    </DataStateWrapper>
  );
}

// Separate component for draw content
function DrawContent({
  draw,
  event,
  t,
}: {
  draw: Draw;
  event: EventWithRSVP | null | undefined;
  t: ReturnType<typeof useTranslations>;
}) {
  // Group assignments by tier and round
  const masterAssignments = draw.assignments.filter((a) => a.tier === 'MASTERS');
  const explorerAssignments = draw.assignments.filter((a) => a.tier === 'EXPLORERS');

  // Group by round
  const groupByRound = (assignments: Assignment[]) => {
    return assignments.reduce((acc: Record<number, Assignment[]>, assignment) => {
      if (!acc[assignment.round]) {
        acc[assignment.round] = [];
      }
      acc[assignment.round].push(assignment);
      return acc;
    }, {});
  };

  const masterRounds = groupByRound(masterAssignments);
  const explorerRounds = groupByRound(explorerAssignments);

  return (
    <div className="space-y-8">
      {/* Masters Tier Matches */}
      <TierSection
        tier="MASTERS"
        rounds={masterRounds}
        assignments={masterAssignments}
        timeSlot={draw.event.tierRules?.mastersTimeSlot}
        eventDate={draw.event.date}
        translations={{
          tierName: t('mastersTier'),
          round: (round) => t('round', { round }),
          courtLabel: (courtId) => t('courtLabel', { courtId }),
          team: t('team'),
        }}
      />

      {/* Explorers Tier Matches */}
      <TierSection
        tier="EXPLORERS"
        rounds={explorerRounds}
        assignments={explorerAssignments}
        timeSlot={draw.event.tierRules?.explorersTimeSlot}
        eventDate={draw.event.date}
        translations={{
          tierName: t('explorersTier'),
          round: (round) => t('round', { round }),
          courtLabel: (courtId) => t('courtLabel', { courtId }),
          team: t('team'),
        }}
      />

      {/* Waitlist Section */}
      <WaitlistSection players={[]} title={t('waitlist', { count: event?.waitlistCount || 0 })} />
    </div>
  );
}
