'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { PlayerNav } from './player-nav';
import { motion, AnimatePresence } from 'motion/react';
import { LoadingState, PageLayout } from '@/components/shared';
import { useMinimumLoading } from '@/hooks/use-minimum-loading';
import { DrawHeader, TierSection, WaitlistSection } from '@/components/shared/draw';
import type { Draw, Assignment } from '@/components/shared/draw';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function DrawView({ eventId }: { eventId: string }) {
  const { data: session } = useSession();
  const t = useTranslations('drawView');
  const locale = useLocale();

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
  const { data: event } = useQuery({
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

  // Use minimum loading to prevent jarring flashes
  const showLoading = useMinimumLoading(isLoading, !!draw);

  return (
    <PageLayout nav={<PlayerNav />} maxWidth="7xl">
      <AnimatePresence mode="wait">
        {showLoading ? (
          <LoadingState message={t('loadingDraw')} />
        ) : error || !draw ? (
          <motion.div
            key="not-found"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center py-8"
          >
            <p className="text-lg font-medium">{t('drawNotAvailable')}</p>
            <p className="text-sm text-muted-foreground mt-2">{t('drawNotAvailableDescription')}</p>
            {error && (
              <p className="text-xs text-red-500 mt-2">
                {t('error')}: {error instanceof Error ? error.message : 'Failed to load draw'}
              </p>
            )}
          </motion.div>
        ) : (
          <DrawContent draw={draw} event={event} t={t} locale={locale} />
        )}
      </AnimatePresence>
    </PageLayout>
  );
}

// Separate component for draw content
function DrawContent({
  draw,
  event,
  t,
  locale,
}: {
  draw: Draw;
  event: any;
  t: any;
  locale: string;
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
    <motion.div
      key="content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <DrawHeader
        title={draw.event.title || t('gameDraw')}
        date={draw.event.date}
        venue={draw.event.venue}
        locale={locale}
      />

      {/* Masters Tier Matches */}
      <TierSection
        tier="MASTERS"
        rounds={masterRounds}
        timeSlot={draw.event.tierRules?.mastersTimeSlot}
        translations={{
          tierName: t('mastersTier'),
          round: (round) => t('round', { round }),
          courtLabel: (courtId) => t('courtLabel', { courtId }),
        }}
      />

      {/* Explorers Tier Matches */}
      <TierSection
        tier="EXPLORERS"
        rounds={explorerRounds}
        timeSlot={draw.event.tierRules?.explorersTimeSlot}
        translations={{
          tierName: t('explorersTier'),
          round: (round) => t('round', { round }),
          courtLabel: (courtId) => t('courtLabel', { courtId }),
        }}
      />

      {/* Waitlist Section */}
      <WaitlistSection
        players={event?.waitlistedPlayers || []}
        title={t('waitlist', { count: event?.waitlistedPlayers?.length || 0 })}
      />
    </motion.div>
  );
}
