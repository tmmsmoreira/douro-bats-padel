'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { useUpcomingEvents } from '@/hooks';
import { EventCard, EventStats, RSVPBadges, DataStateWrapper } from '@/components/shared';

export function EventsList() {
  const t = useTranslations('home');

  const { data: events, isLoading } = useUpcomingEvents();

  return (
    <DataStateWrapper
      isLoading={isLoading}
      data={events}
      loadingMessage={t('loadingEvents')}
      emptyMessage={t('noEventsAvailable')}
    >
      {(events) => (
        <div className="space-y-4">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  delay: 0.2,
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid gap-4"
          >
            {events.map((event) => (
              <motion.div
                key={event.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
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
