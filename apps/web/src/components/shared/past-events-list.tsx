'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { usePastEvents, useMinimumLoading } from '@/hooks';
import { EventCard, EventStats, StatusBadge, LoadingState } from '@/components/shared';
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function PastEventsList() {
  const t = useTranslations();

  const { data: allEvents, isLoading } = usePastEvents();
  const showLoading = useMinimumLoading(isLoading, !!allEvents);

  // Sort by date descending (most recent first) and take only the last 10
  const events = useMemo(() => {
    if (!allEvents) return [];
    return allEvents
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [allEvents]);

  return (
    <AnimatePresence mode="wait">
      {showLoading ? (
        <LoadingState message={t('common.loading')} />
      ) : !events || events.length === 0 ? (
        <motion.div
          key="no-past-events"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-card">
            <CardContent className="py-8 text-center text-muted-foreground">
              {t('home.noPastEvents')}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          key="past-events-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
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
            {events.map((event) => {
              const userStatus = event.userRSVP?.status;
              const isConfirmed = userStatus === 'CONFIRMED';
              const isWaitlisted = userStatus === 'WAITLISTED';

              return (
                <motion.div
                  key={event.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  }}
                  className="opacity-90"
                >
                  <EventCard
                    event={event}
                    showVenue
                    headerActions={
                      <>
                        {isConfirmed && (
                          <StatusBadge status="PARTICIPATED" label={t('home.participated')} />
                        )}
                        {isWaitlisted && (
                          <StatusBadge status="WAITLISTED" label={t('home.waitlisted')} />
                        )}
                      </>
                    }
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <EventStats
                        event={event}
                        confirmedLabel={t('home.confirmed')}
                        waitlistedLabel={t('home.waitlisted')}
                      />
                      <div className="flex gap-2 w-full sm:w-auto">
                        {event.state === 'PUBLISHED' && (
                          <>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1 sm:flex-none"
                            >
                              <Button variant="outline" className="w-full rounded-lg" asChild>
                                <Link href={`/events/${event.id}/results`}>
                                  {t('home.viewResults')}
                                </Link>
                              </Button>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1 sm:flex-none"
                            >
                              <Button variant="outline" className="w-full rounded-lg" asChild>
                                <Link href={`/events/${event.id}/draw`}>{t('home.viewDraw')}</Link>
                              </Button>
                            </motion.div>
                          </>
                        )}
                      </div>
                    </div>
                  </EventCard>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
