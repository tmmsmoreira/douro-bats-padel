'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { usePastEvents, useIsFromBfcache } from '@/hooks';
import { EventCard, EventStats, StatusBadge, DataStateWrapper } from '@/components/shared';
import { EventsListSkeleton } from '@/components/shared/event/event-skeletons';
import { useMemo } from 'react';
import { motion } from 'motion/react';

export function PastEventsList() {
  const t = useTranslations('home');
  const isFromBfcache = useIsFromBfcache();

  const { data: allEvents, isLoading } = usePastEvents();

  // Sort by date descending (most recent first) and take only the last 10
  const events = useMemo(() => {
    if (!allEvents) return [];
    return allEvents
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [allEvents]);

  return (
    <DataStateWrapper
      isLoading={isLoading}
      data={events}
      loadingMessage={t('loadingEvents')}
      loadingComponent={<EventsListSkeleton count={3} />}
      emptyMessage={t('noPastEvents')}
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
                  delay: isFromBfcache ? 0 : 0.2,
                  staggerChildren: isFromBfcache ? 0 : 0.1,
                },
              },
            }}
            className="grid gap-4"
          >
            {events.map((event) => {
              const userStatus = event.userRSVP?.status;
              const isConfirmed = userStatus === 'CONFIRMED';
              const isWaitlisted = userStatus === 'WAITLISTED';

              return (
                <motion.div
                  key={event.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { duration: isFromBfcache ? 0 : 0.4 } },
                  }}
                  className="opacity-90"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Link href={`/events/${event.id}`} className="block">
                    <EventCard
                      event={event}
                      showVenue
                      animate={false}
                      headerActions={
                        <>
                          {isConfirmed && (
                            <StatusBadge status="PARTICIPATED" label={t('participated')} />
                          )}
                          {isWaitlisted && (
                            <StatusBadge status="WAITLISTED" label={t('waitlisted')} />
                          )}
                        </>
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
              );
            })}
          </motion.div>
        </div>
      )}
    </DataStateWrapper>
  );
}
