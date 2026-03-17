'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { Calendar, Clock } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { HomeAdaptiveNav } from '@/components/shared/home-adaptive-nav';
import { DataStateWrapper, PageLayout, PageHeader, StatusBadge } from '@/components/shared';
import { ConfirmedPlayersSection, EventHeaderInfo } from '@/components/shared/event';
import { WaitlistSection } from '@/components/shared/draw';
import { useRSVP } from '@/hooks';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Player {
  id: string;
  name: string;
  rating: number;
  profilePhoto?: string | null;
}

interface WaitlistedPlayer extends Player {
  position: number;
}

interface TierTimeSlot {
  startsAt: string;
  endsAt: string;
  courtIds: string[];
}

interface TierRules {
  masterCount?: number;
  masterPercentage?: number;
  mastersTimeSlot?: TierTimeSlot;
  explorersTimeSlot?: TierTimeSlot;
}

interface EventDetails {
  id: string;
  title: string | null;
  date: string;
  startsAt: string;
  endsAt: string;
  rsvpOpensAt: string;
  rsvpClosesAt: string;
  capacity: number;
  state: 'DRAFT' | 'OPEN' | 'FROZEN' | 'DRAWN' | 'PUBLISHED';
  venue?: {
    id: string;
    name: string;
  };
  confirmedCount: number;
  waitlistCount: number;
  confirmedPlayers: Player[];
  waitlistedPlayers: WaitlistedPlayer[];
  tierRules?: TierRules;
  userRSVP?: {
    status: 'CONFIRMED' | 'WAITLISTED';
    position?: number;
  };
}

export function EventDetails({ eventId }: { eventId: string }) {
  const { data: session } = useSession();
  const t = useTranslations('eventDetails');
  const locale = useLocale();

  const { data: event, isLoading } = useQuery<EventDetails>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }
      const res = await fetch(`${API_URL}/events/${eventId}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch event');
      return res.json();
    },
  });

  return (
    <PageLayout nav={<HomeAdaptiveNav />}>
      <DataStateWrapper
        isLoading={isLoading}
        data={event}
        loadingMessage={t('loadingEvent')}
        emptyMessage={t('eventNotFound')}
      >
        {(event) => <EventDetailsContent event={event} locale={locale} t={t} />}
      </DataStateWrapper>
    </PageLayout>
  );
}

// Separate component for event details content
function EventDetailsContent({
  event,
  locale,
  t,
}: {
  event: EventDetails;
  locale: string;
  t: any;
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
  const canRegister = !!(session && now >= rsvpOpens && now <= rsvpCloses);

  const handleRSVP = (status: 'IN' | 'OUT') => {
    rsvpMutation.mutate({ eventId: event.id, status });
  };

  // Show message for published events
  if (event.state === 'PUBLISHED') {
    return (
      <div className="space-y-6">
        <PageHeader
          title={event.title || t('untitledEvent')}
          description={new Date(event.date).toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          showBackButton
          backButtonHref="/"
          backButtonLabel={t('backToEvents')}
        />

        <Card className="glass-card">
          <CardContent className="pt-6 pb-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <div className="pt-4">
                <p className="text-lg mb-6">{t('drawPublishedMessage')}</p>
                <Link href={`/events/${event.id}/draw`}>
                  <Button size="lg" className="w-full sm:w-auto">
                    {t('viewDraw')}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const spotsRemaining = event.capacity - event.confirmedCount;

  return (
    <div className="space-y-6">
      <PageHeader
        title={event.title || t('untitledEvent')}
        description={<EventHeaderInfo event={event} locale={locale} showStatus={false} />}
        showBackButton
        backButtonHref="/"
        backButtonLabel={t('backToEvents')}
      />

      <div className="space-y-8">
        {/* RSVP Buttons */}
        {session && (
          <Card className="glass-card">
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>{t('registrationTitle')}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('registrationDescription')}
                  </p>
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
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {event.tierRules.mastersTimeSlot && (
                <Badge
                  variant="outline"
                  className="text-sm px-3 py-1 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800"
                >
                  <Clock className="mr-2 h-3 w-3" />
                  <span className="font-semibold">{t('masters')}</span>
                  <span className="ml-1">
                    {event.tierRules.mastersTimeSlot.startsAt} -{' '}
                    {event.tierRules.mastersTimeSlot.endsAt}
                  </span>
                </Badge>
              )}
              {event.tierRules.explorersTimeSlot && (
                <Badge
                  variant="outline"
                  className="text-sm px-3 py-1 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                >
                  <Clock className="mr-2 h-3 w-3" />
                  <span className="font-semibold">{t('explorers')}</span>
                  <span className="ml-1">
                    {event.tierRules.explorersTimeSlot.startsAt} -{' '}
                    {event.tierRules.explorersTimeSlot.endsAt}
                  </span>
                </Badge>
              )}
            </div>
          )}
      </div>

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
