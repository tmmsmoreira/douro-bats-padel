'use client';

import { motion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useUpcomingEvents, useIsFromBfcache } from '@/hooks';
import { EventCard, EventStats, RSVPBadges, DataStateWrapper } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function HomeUpcomingEvents() {
  const t = useTranslations('home');
  const isFromBfcache = useIsFromBfcache();
  const { data: events, isLoading } = useUpcomingEvents();

  // Show only first 3 events on home page
  const displayEvents = events?.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-3 sm:space-y-4"
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading">
          {t('upcomingEvents.title')}
        </h2>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('upcomingEvents.description')}
        </p>
      </motion.div>

      {/* Events List */}
      <DataStateWrapper
        isLoading={isLoading}
        data={displayEvents}
        loadingMessage={t('upcomingEvents.loadingEvents')}
        emptyMessage={t('upcomingEvents.noEvents')}
      >
        {(events) => (
          <div className="space-y-6">
            <motion.div
              initial={isFromBfcache ? false : 'hidden'}
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    delay: isFromBfcache ? 0 : 0.2,
                    staggerChildren: isFromBfcache ? 0 : 0.15,
                  },
                },
              }}
              className="grid gap-6"
            >
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                    show: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { duration: isFromBfcache ? 0 : 0.5 },
                    },
                  }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
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

            {/* View All Button - only show if there are more than 3 events */}
            {events && events.length >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-center pt-4"
              >
                <Link href="/events">
                  <Button variant="outline" size="lg" className="group">
                    {t('upcomingEvents.viewAll')}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        )}
      </DataStateWrapper>
    </div>
  );
}
