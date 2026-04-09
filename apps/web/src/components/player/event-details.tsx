'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { StatusBadge } from '@/components/shared';
import { ConfirmedPlayersSection } from '@/components/shared/event';
import { WaitlistSection } from '@/components/shared/draw';
import { useSession } from 'next-auth/react';
import { useRSVP, useEventDetails } from '@/hooks';
import { formatTimeSlot } from '@/lib/utils';
import type { EventWithPlayersSerialized } from '@padel/types';

export function EventDetails({ eventId }: { eventId: string }) {
  const t = useTranslations('eventDetails');
  const locale = useLocale();

  const { data: event, isLoading } = useEventDetails(eventId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return <EventDetailsContent event={event} locale={locale} t={t} />;
}

// Separate component for event details content
function EventDetailsContent({
  event,
  locale,
  t,
}: {
  event: EventWithPlayersSerialized;
  locale: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const { data: session } = useSession();
  const rsvpMutation = useRSVP([['event', event.id]]);

  const userStatus = event.userRSVP?.status;
  const isConfirmed = userStatus === 'CONFIRMED';
  const isWaitlisted = userStatus === 'WAITLISTED';
  const isFull = event.confirmedCount >= event.capacity;
  const now = new Date();
  const rsvpOpens = new Date(event.rsvpOpensAt);
  const rsvpCloses = new Date(event.rsvpClosesAt);
  const eventDate = new Date(event.date);
  const isPastEvent = eventDate < now;
  const canRegister = !!(session && now >= rsvpOpens && now <= rsvpCloses && !isPastEvent);

  const handleRSVP = (status: 'IN' | 'OUT') => {
    rsvpMutation.mutate({ eventId: event.id, status });
  };

  const spotsRemaining = event.capacity - event.confirmedCount;

  return (
    <div className="space-y-8">
      {/* RSVP Buttons - Only show for non-past events */}
      {session && !isPastEvent && (
        <Card className="glass-card">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{t('registrationTitle')}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{t('registrationDescription')}</p>
              </div>
              <div className="flex flex-wrap gap-4">
                {canRegister && !isConfirmed && !isWaitlisted && (
                  <Button
                    onClick={() => handleRSVP('IN')}
                    disabled={rsvpMutation.isPending}
                    className="w-full gap-2"
                    animate
                  >
                    {rsvpMutation.isPending && (
                      <Spinner data-icon="inline-start" className="h-4 w-4" />
                    )}
                    {isFull ? t('registerToWaitlist') : t('register')}
                  </Button>
                )}
                {(isConfirmed || isWaitlisted) && (
                  <>
                    <div className="flex items-center gap-2">
                      {isConfirmed && (
                        <StatusBadge status="CONFIRMED" label={t('confirmedBadge')} />
                      )}
                      {isWaitlisted && (
                        <StatusBadge
                          status="WAITLISTED"
                          label={t('waitlistedPosition', {
                            position: event.userRSVP?.position || 0,
                          })}
                        />
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleRSVP('OUT')}
                      disabled={rsvpMutation.isPending}
                      className="w-full sm:w-auto gap-2"
                      animate
                    >
                      {rsvpMutation.isPending && (
                        <Spinner data-icon="inline-start" className="h-4 w-4" />
                      )}
                      {t('unregister')}
                    </Button>
                  </>
                )}
                {!canRegister && !isConfirmed && !isWaitlisted && (
                  <p className="text-sm text-muted-foreground text-center">
                    {now < rsvpOpens ? t('rsvpNotOpenYet') : t('rsvpClosed')}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Tier Time Slots */}
      {event.tierRules &&
        (event.tierRules.mastersTimeSlot || event.tierRules.explorersTimeSlot) && (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {event.tierRules.mastersTimeSlot && (
              <Badge variant="outline" className="text-sm px-3 py-1 bg-white dark:bg-white/5">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                <span className="font-semibold">{t('masters')}</span>
                <Clock className="mx-1.5 h-3 w-3 text-muted-foreground" />
                <span>
                  {formatTimeSlot(event.tierRules.mastersTimeSlot.startsAt, event.date, locale)} -{' '}
                  {formatTimeSlot(event.tierRules.mastersTimeSlot.endsAt, event.date, locale)}
                </span>
              </Badge>
            )}
            {event.tierRules.explorersTimeSlot && (
              <Badge variant="outline" className="text-sm px-3 py-1 bg-white dark:bg-white/5">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <span className="font-semibold">{t('explorers')}</span>
                <Clock className="mx-1.5 h-3 w-3 text-muted-foreground" />
                <span>
                  {formatTimeSlot(event.tierRules.explorersTimeSlot.startsAt, event.date, locale)} -{' '}
                  {formatTimeSlot(event.tierRules.explorersTimeSlot.endsAt, event.date, locale)}
                </span>
              </Badge>
            )}
          </div>
        )}

      {/* Confirmed Players */}
      <ConfirmedPlayersSection
        players={event.confirmedPlayers || []}
        confirmedCount={event.confirmedCount}
        capacity={event.capacity}
        title={t('confirmedPlayers')}
        spotsRemainingText={t('spotsRemaining', { count: spotsRemaining })}
        showAvatar={true}
        showIndex={true}
        showCapacityBadge={true}
        capacityBadgeText={t('spotsRemaining', { count: spotsRemaining })}
        fullCapacityText={t('fullCapacity')}
        emptyMessage={t('noConfirmedPlayers')}
        canRegister={canRegister}
      />

      {/* Waitlist */}
      {event.waitlistedPlayers && event.waitlistedPlayers.length > 0 && (
        <WaitlistSection
          players={event.waitlistedPlayers}
          showAvatar={true}
          avatarSize="md"
          title={`${t('waitlist')} (${event.waitlistCount})`}
        />
      )}
    </div>
  );
}
