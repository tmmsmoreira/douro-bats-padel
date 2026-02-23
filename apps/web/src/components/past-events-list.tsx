'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { usePastEvents } from '@/hooks';
import { EventCard, EventStats } from '@/components/shared';
import { useMemo } from 'react';

export function PastEventsList() {
  const t = useTranslations();

  const { data: allEvents, isLoading } = usePastEvents();

  // Sort by date descending (most recent first) and take only the last 10
  const events = useMemo(() => {
    if (!allEvents) return [];
    return allEvents
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [allEvents]);

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t('home.noPastEvents')}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {events.map((event) => {
          const userStatus = event.userRSVP?.status;
          const isConfirmed = userStatus === 'CONFIRMED';
          const isWaitlisted = userStatus === 'WAITLISTED';

          return (
            <div key={event.id} className="opacity-90">
              <EventCard
                event={event}
                showVenue
                headerActions={
                  <div className="flex flex-col items-end gap-2">
                    {isConfirmed && (
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-950">
                        {t('home.participated')}
                      </Badge>
                    )}
                    {isWaitlisted && (
                      <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950">
                        {t('home.waitlisted')}
                      </Badge>
                    )}
                  </div>
                }
              >
                <div className="flex items-center justify-between">
                  <EventStats
                    event={event}
                    confirmedLabel={t('home.confirmed')}
                    waitlistedLabel={t('home.waitlisted')}
                  />
                  <div className="flex gap-2">
                    {event.state === 'PUBLISHED' && (
                      <>
                        <Link href={`/events/${event.id}/results`}>
                          <Button size="sm" variant="outline">
                            {t('home.viewResults')}
                          </Button>
                        </Link>
                        <Link href={`/events/${event.id}/draw`}>
                          <Button size="sm" variant="outline">
                            {t('home.viewDraw')}
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </EventCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}
