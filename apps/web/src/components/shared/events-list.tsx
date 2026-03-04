'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { useUpcomingEvents, useRSVP } from '@/hooks';
import { EventCard, EventStats, RSVPBadges, RSVPButtons } from '@/components/shared';

export function EventsList() {
  const { data: session } = useSession();
  const t = useTranslations('home');

  const { data: events, isLoading } = useUpcomingEvents();
  const rsvpMutation = useRSVP([['events']]);

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
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            showVenue
            headerActions={
              <RSVPBadges
                event={event}
                confirmedText={t('confirmedBadge')}
                waitlistText={t('waitlistedPosition', { position: event.userRSVP?.position || 0 })}
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
        ))}
      </div>
    </div>
  );
}
