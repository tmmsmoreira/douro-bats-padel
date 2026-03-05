'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUpcomingEvents, useRSVP } from '@/hooks';
import { EventCard, EventStats } from '@/components/shared';
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
                {isConfirmed && <Badge variant="default">{t('confirmed')}</Badge>}
                {isWaitlisted && (
                  <Badge variant="secondary">
                    {t('waitlist')} #{event.userRSVP?.position}
                  </Badge>
                )}
              </>
            }
          >
            <div className="flex items-center justify-between">
              <EventStats
                event={event}
                confirmedLabel={t('confirmedCount')}
                waitlistedLabel={t('waitlisted')}
              />
              <div className="flex gap-2">
                {canRegister && !isConfirmed && !isWaitlisted && (
                  <Button
                    size="sm"
                    onClick={() => handleRSVP(event.id, 'IN')}
                    disabled={rsvpMutation.isPending}
                  >
                    {t('register')}
                  </Button>
                )}
                {(isConfirmed || isWaitlisted) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRSVP(event.id, 'OUT')}
                    disabled={rsvpMutation.isPending}
                  >
                    {t('cancel')}
                  </Button>
                )}
                <Link href={`/events/${event.id}`}>
                  <Button size="sm" variant="outline">
                    {t('viewDetails')}
                  </Button>
                </Link>
                {event.state === 'PUBLISHED' && (
                  <>
                    <Link href={`/events/${event.id}/draw`}>
                      <Button size="sm" variant="outline">
                        {t('viewDraw')}
                      </Button>
                    </Link>
                    <Link href={`/events/${event.id}/results`}>
                      <Button size="sm" variant="outline">
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
