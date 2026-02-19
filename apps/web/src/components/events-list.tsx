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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function EventsList() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const t = useTranslations('home');

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', session?.accessToken],
    queryFn: async () => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Include auth token if user is logged in
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }

      const res = await fetch(`${API_URL}/events`, { headers });

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
      }

      return res.json() as Promise<EventWithRSVP[]>;
    },
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: 'IN' | 'OUT' }) => {
      if (!session?.accessToken) {
        throw new Error('Not authenticated');
      }

      const res = await fetch(`${API_URL}/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || `API Error: ${res.statusText}`);
      }

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success(data.message || t('rsvpSuccess'));
    },
    onError: (error: Error) => {
      toast.error(error.message || t('rsvpError'));
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">{t('loadingEvents')}</div>;
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t('noEventsAvailable')}
        </CardContent>
      </Card>
    );
  }

  const handleRSVP = (eventId: string, status: 'IN' | 'OUT') => {
    rsvpMutation.mutate({ eventId, status });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {events.map((event) => {
          const userStatus = event.userRSVP?.status;
          const isConfirmed = userStatus === 'CONFIRMED';
          const isWaitlisted = userStatus === 'WAITLISTED';
          const isFull = event.confirmedCount >= event.capacity;
          const canRegister =
            session &&
            new Date() >= new Date(event.rsvpOpensAt) &&
            new Date() <= new Date(event.rsvpClosesAt);

          // Debug logging
          if (session && process.env.NODE_ENV === 'development') {
            console.log(`Event ${event.id}:`, {
              userRSVP: event.userRSVP,
              isConfirmed,
              isWaitlisted,
              isFull,
              canRegister,
            });
          }

          return (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{event.title || t('gameNight')}</CardTitle>
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
                      <div className="flex items-center">
                        <Badge variant="default" className="uppercase">
                          {t('confirmedBadge')}
                        </Badge>
                      </div>
                    )}
                    {isWaitlisted && (
                      <div className="flex items-center">
                        <Badge variant="secondary" className="uppercase">
                          {t('waitlistedPosition', { position: event.userRSVP?.position || 0 })}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex flex-wrap gap-3 sm:gap-4 text-sm">
                    <span>
                      <strong>{event.confirmedCount}</strong> / {event.capacity} {t('confirmed')}
                    </span>
                    {event.waitlistCount > 0 && (
                      <span className="text-muted-foreground">
                        {event.waitlistCount} {t('waitlisted')}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {session ? (
                      <>
                        {canRegister && !isConfirmed && !isWaitlisted && (
                          <Button
                            size="sm"
                            onClick={() => handleRSVP(event.id, 'IN')}
                            disabled={rsvpMutation.isPending}
                            className="flex-1 sm:flex-none"
                          >
                            {isFull ? t('registerToWaitlist') : t('register')}
                          </Button>
                        )}
                        {(isConfirmed || isWaitlisted) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRSVP(event.id, 'OUT')}
                            disabled={rsvpMutation.isPending}
                            className="flex-1 sm:flex-none"
                          >
                            {t('unregister')}
                          </Button>
                        )}
                      </>
                    ) : (
                      <Link href="/login" className="flex-1 sm:flex-none">
                        <Button size="sm" className="w-full">
                          {t('signInToRegister')}
                        </Button>
                      </Link>
                    )}
                    <Link href={`/events/${event.id}`} className="flex-1 sm:flex-none">
                      <Button size="sm" variant="outline" className="w-full">
                        {t('viewDetails')}
                      </Button>
                    </Link>
                    {event.state === 'PUBLISHED' && (
                      <Link href={`/events/${event.id}/draw`} className="flex-1 sm:flex-none">
                        <Button size="sm" variant="outline" className="w-full">
                          {t('viewDraw')}
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
