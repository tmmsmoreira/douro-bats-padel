'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatTime } from '@/lib/utils';
import Link from 'next/link';
import type { EventWithRSVP } from '@padel/types';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function EventsList() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const t = useTranslations('playerEventsList');

  const { data: events, isLoading } = useQuery({
    queryKey: ['player-events'],
    queryFn: async () => {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }
      const res = await fetch(`${API_URL}/events`, { headers });
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json() as Promise<EventWithRSVP[]>;
    },
    enabled: !!session,
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: 'IN' | 'OUT' }) => {
      if (!session?.accessToken) throw new Error('Not authenticated');
      const res = await fetch(`${API_URL}/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to update RSVP' }));
        throw new Error(errorData.message || 'Failed to update RSVP');
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['player-events'] });
      toast.success(data.message || 'RSVP updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update RSVP');
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">{t('loadingEvents')}</div>;
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
          <Card key={event.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{event.title || t('gameNight')}</CardTitle>
                  <CardDescription>
                    {formatDate(event.date)} • {formatTime(event.startsAt)} -{' '}
                    {formatTime(event.endsAt)}
                  </CardDescription>
                  {event.venue && (
                    <p className="text-sm text-muted-foreground mt-1">{event.venue.name}</p>
                  )}
                </div>
                {isConfirmed && <Badge variant="default">{t('confirmed')}</Badge>}
                {isWaitlisted && (
                  <Badge variant="secondary">
                    {t('waitlist')} #{event.userRSVP?.position}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-sm">
                  <span>
                    <strong>{event.confirmedCount}</strong> / {event.capacity} {t('confirmedCount')}
                  </span>
                  {event.waitlistCount > 0 && (
                    <span className="text-muted-foreground">
                      {event.waitlistCount} {t('waitlisted')}
                    </span>
                  )}
                </div>
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
                    <Link href={`/events/${event.id}/draw`}>
                      <Button size="sm" variant="outline">
                        {t('viewDraw')}
                      </Button>
                    </Link>
                  )}
                  {event.state === 'PUBLISHED' && (
                    <Link href={`/events/${event.id}/results`}>
                      <Button size="sm" variant="outline">
                        {t('viewResults')}
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
  );
}
