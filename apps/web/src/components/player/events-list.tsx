'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUpcomingEvents, useRSVP } from '@/hooks';
import { EventCard, EventStats, StatusBadge } from '@/components/shared';
import { Spinner } from '../ui/spinner';

export function EventsList() {
  const t = useTranslations('playerEventsList');

  const { data: events, isLoading } = useUpcomingEvents(['player-events']);
  const rsvpMutation = useRSVP([['player-events']]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner data-icon="inline-start" className="mr-2" />
        {t('loadingEvents')}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t('noUpcomingEvents')}
        </CardContent>
      </Card>
    );
  }

  const handleRSVP = (eventId: string, status: 'IN' | 'OUT') => {
    rsvpMutation.mutate({ eventId, status });
  };

  return (
    <div className="grid gap-4">
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
    </div>
  );
}
