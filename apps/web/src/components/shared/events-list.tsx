'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { useUpcomingEvents, useRSVP, useMinimumLoading } from '@/hooks';
import { EventCard, EventStats, RSVPBadges, RSVPButtons, LoadingState } from '@/components/shared';

export function EventsList() {
  const { data: session } = useSession();
  const t = useTranslations('home');

  const { data: events, isLoading } = useUpcomingEvents();
  const rsvpMutation = useRSVP([['events']]);
  const showLoading = useMinimumLoading(isLoading, !!events);

  const handleRSVP = (eventId: string, status: 'IN' | 'OUT') => {
    rsvpMutation.mutate({ eventId, status });
  };

  if (showLoading) {
    return <LoadingState message={t('loadingEvents')} />;
  }

  if (!events || events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="glass-card">
          <CardContent className="py-8 text-center text-muted-foreground">
            {t('noEventsAvailable')}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
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
          >
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <EventStats
                  event={event}
                  confirmedLabel={t('confirmed')}
                  waitlistedLabel={t('waitlisted')}
                />
                <RSVPButtons
                  event={event}
                  session={session}
                  onRSVP={handleRSVP}
                  isPending={rsvpMutation.isPending}
                  registerText={t('register')}
                  registerToWaitlistText={t('registerToWaitlist')}
                  unregisterText={t('unregister')}
                  signInToRegisterText={t('signInToRegister')}
                  viewDetailsText={t('viewDetails')}
                  viewDrawText={t('viewDraw')}
                />
              </div>
            </EventCard>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
