'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { useUpcomingEvents, useIsFromBfcache } from '@/hooks';
import { EventCard, EventStats, RSVPBadges, DataStateWrapper } from '@/components/shared';
import { EventsListSkeleton } from '@/components/shared/event/event-skeletons';

export function EventsList({ from }: { from?: string } = {}) {
  const t = useTranslations('home');
  const tErrors = useTranslations('errors');
  const isFromBfcache = useIsFromBfcache();

  const { data: events, isLoading, error } = useUpcomingEvents({ from });

  return (
    <DataStateWrapper
      isLoading={isLoading}
      data={events}
      error={error}
      loadingMessage={t('loadingEvents')}
      loadingComponent={<EventsListSkeleton />}
      emptyMessage={t('noEventsAvailable')}
      errorMessage={tErrors('failedToLoadEvents')}
    >
      {(events) => (
        <div className="space-y-4">
          <motion.div
            initial={isFromBfcache ? false : 'hidden'}
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  delay: isFromBfcache ? 0 : 0.1,
                  staggerChildren: isFromBfcache ? 0 : 0.05,
                },
              },
            }}
            className="grid gap-4"
          >
            {events.map((event) => (
              <motion.div
                key={event.id}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: isFromBfcache ? 0 : 0.3,
                      ease: 'easeOut',
                    },
                  },
                }}
              >
                <Link href={`/events/${event.id}`} className="block">
                  <EventCard
                    event={event}
                    showVenue
                    animate={false}
                    headerActions={
                      <RSVPBadges
                        event={event}
                        confirmedText={t('confirmedBadge')}
                        waitlistText={t('waitlistedPosition', {
                          position: event.userRSVP?.position || 0,
                        })}
                      />
                    }
                  >
                    <EventStats
                      event={event}
                      confirmedLabel={t('confirmed')}
                      waitlistedLabel={t('waitlisted')}
                    />
                  </EventCard>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </DataStateWrapper>
  );
}
