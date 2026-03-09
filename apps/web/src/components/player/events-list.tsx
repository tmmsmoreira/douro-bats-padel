'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUpcomingEvents, useRSVP } from '@/hooks';
import { EventCard, EventStats, StatusBadge } from '@/components/shared';
import { motion, AnimatePresence } from 'motion/react';
import { LoadingState } from '@/components/shared/loading-state';
import { useMinimumLoading } from '@/hooks/use-minimum-loading';

export function EventsList() {
  const t = useTranslations('playerEventsList');

  const { data: events, isLoading } = useUpcomingEvents(['player-events']);
  const rsvpMutation = useRSVP([['player-events']]);

  // Use minimum loading to prevent jarring flashes
  const showLoading = useMinimumLoading(isLoading, !!events);

  const handleRSVP = (eventId: string, status: 'IN' | 'OUT') => {
    rsvpMutation.mutate({ eventId, status });
  };

  return (
    <AnimatePresence mode="wait">
      {showLoading ? (
        <LoadingState message={t('loadingEvents')} />
      ) : !events || events.length === 0 ? (
        <motion.div
          key="no-events"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {t('noUpcomingEvents')}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <EventsListContent
          events={events}
          handleRSVP={handleRSVP}
          rsvpMutation={rsvpMutation}
          t={t}
        />
      )}
    </AnimatePresence>
  );
}

// Separate component for events list content
function EventsListContent({ events, handleRSVP, rsvpMutation, t }: any) {
  return (
    <motion.div
      key="content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="grid gap-4"
    >
      {events.map((event) => {
        const userStatus = event.userRSVP?.status;
        const isConfirmed = userStatus === 'CONFIRMED';
        const isWaitlisted = userStatus === 'WAITLISTED';
        const canRegister =
          new Date() >= new Date(event.rsvpOpensAt) && new Date() <= new Date(event.rsvpClosesAt);

        return (
          <EventCard
            key={event.id}
            event={event}
            showVenue
            headerActions={
              <>
                {isConfirmed && <StatusBadge status="CONFIRMED" label={t('confirmed')} />}
                {isWaitlisted && (
                  <StatusBadge
                    status="WAITLISTED"
                    label={`${t('waitlist')} #${event.userRSVP?.position}`}
                  />
                )}
              </>
            }
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <EventStats
                event={event}
                confirmedLabel={t('confirmedCount')}
                waitlistedLabel={t('waitlisted')}
              />
              <div className="flex gap-2 w-full sm:w-auto">
                {canRegister && !isConfirmed && !isWaitlisted && (
                  <Button
                    size="default"
                    onClick={() => handleRSVP(event.id, 'IN')}
                    disabled={rsvpMutation.isPending}
                    className="flex-1 sm:flex-none rounded-lg"
                  >
                    {t('register')}
                  </Button>
                )}
                {(isConfirmed || isWaitlisted) && (
                  <Button
                    size="default"
                    variant="outline"
                    onClick={() => handleRSVP(event.id, 'OUT')}
                    disabled={rsvpMutation.isPending}
                    className="flex-1 sm:flex-none rounded-lg"
                  >
                    {t('cancel')}
                  </Button>
                )}
                <Link href={`/events/${event.id}`} className="flex-1 sm:flex-none">
                  <Button size="default" variant="outline" className="w-full rounded-lg">
                    {t('viewDetails')}
                  </Button>
                </Link>
                {event.state === 'PUBLISHED' && (
                  <>
                    <Link href={`/events/${event.id}/draw`} className="flex-1 sm:flex-none">
                      <Button size="default" variant="outline" className="w-full rounded-lg">
                        {t('viewDraw')}
                      </Button>
                    </Link>
                    <Link href={`/events/${event.id}/results`} className="flex-1 sm:flex-none">
                      <Button size="default" variant="outline" className="w-full rounded-lg">
                        {t('viewResults')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </EventCard>
        );
      })}
    </motion.div>
  );
}
