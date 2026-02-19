'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatTime } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import type { EventWithRSVP } from '@padel/types';
import { useTranslations } from 'next-intl';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function PastEventsList() {
  const { data: session } = useSession();
  const t = useTranslations();

  const { data: events, isLoading } = useQuery({
    queryKey: ['past-events', session?.accessToken],
    queryFn: async () => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Include auth token if user is logged in
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }

      // Fetch events from the past (before today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const to = today.toISOString();

      const res = await fetch(`${API_URL}/events?to=${to}`, { headers });

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
      }

      const allPastEvents = (await res.json()) as EventWithRSVP[];

      // Sort by date descending (most recent first) and take only the last 10
      return allPastEvents
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);
    },
  });

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
            <Card key={event.id} className="opacity-90">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{event.title || 'Game Night'}</CardTitle>
                    <CardDescription>
                      {formatDate(event.date)} • {formatTime(event.startsAt)} -{' '}
                      {formatTime(event.endsAt)}
                    </CardDescription>
                    {event.venue && (
                      <p className="text-sm text-muted-foreground mt-1">{event.venue.name}</p>
                    )}
                  </div>
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
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>
                      <strong>{event.confirmedCount}</strong> / {event.capacity}{' '}
                      {t('home.confirmed')}
                    </span>
                    {event.waitlistCount > 0 && (
                      <span>
                        {event.waitlistCount} {t('home.waitlisted')}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {event.state === 'PUBLISHED' && (
                      <Link href={`/events/${event.id}/results`}>
                        <Button size="sm" variant="outline">
                          {t('home.viewResults')}
                        </Button>
                      </Link>
                    )}
                    {event.state === 'PUBLISHED' && (
                      <Link href={`/events/${event.id}/draw`}>
                        <Button size="sm" variant="outline">
                          {t('home.viewDraw')}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
