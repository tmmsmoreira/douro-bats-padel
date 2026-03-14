'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { HomeAdaptiveNav } from '@/components/shared/home-adaptive-nav';
import { formatTime } from '@/lib/utils';
import { DataStateWrapper, PageLayout, PageHeader } from '@/components/shared';
import { useRSVP } from '@/hooks';
import { motion } from 'motion/react';

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
  state: string;
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
  const canRegister = session && now >= rsvpOpens && now <= rsvpCloses;

  const handleRSVP = (status: 'IN' | 'OUT') => {
    rsvpMutation.mutate({ eventId: event.id, status });
  };

  // Show message for published events
  if (event.state === 'PUBLISHED') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
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
      </motion.div>
    );
  }

  const spotsRemaining = event.capacity - event.confirmedCount;

  // Build description with event details
  const eventDescription = (
    <div className="flex gap-4 text-sm flex-wrap">
      <div className="flex items-center gap-1">
        <Calendar className="h-4 w-4" />
        <span>
          {new Date(event.date).toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="h-4 w-4" />
        <span>
          {formatTime(event.startsAt, locale)} - {formatTime(event.endsAt, locale)}
        </span>
      </div>
      {event.venue && (
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>{event.venue.name}</span>
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title={event.title || t('untitledEvent')}
        description={eventDescription}
        showBackButton
        backButtonHref="/"
        backButtonLabel={t('backToEvents')}
      />

      {/* RSVP Buttons */}
      {session && event.state !== 'PUBLISHED' && (
        <Card className="glass-card">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col gap-3">
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
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                  <div className="flex items-center gap-2">
                    {isConfirmed && (
                      <Badge variant="default" className="text-sm">
                        {t('confirmedBadge')}
                      </Badge>
                    )}
                    {isWaitlisted && (
                      <Badge variant="secondary" className="text-sm">
                        {t('waitlistedPosition', { position: event.userRSVP?.position || 0 })}
                      </Badge>
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
                </div>
              )}
              {!canRegister && !isConfirmed && !isWaitlisted && (
                <p className="text-sm text-muted-foreground text-center">
                  {now < rsvpOpens ? t('rsvpNotOpenYet') : t('rsvpClosed')}
                </p>
              )}
            </div>
          </CardContent>
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

      {/* Confirmed Players */}
      <Card className="glass-card">
        <CardHeader className="bg-green-50 dark:bg-green-950/30">
          <div className="flex items-center justify-between">
            <CardTitle>
              {t('confirmedPlayers')} ({event.confirmedCount}/{event.capacity})
            </CardTitle>
            {spotsRemaining > 0 ? (
              <Badge variant="secondary">{t('spotsRemaining', { count: spotsRemaining })}</Badge>
            ) : (
              <Badge variant="default">{t('fullCapacity')}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {event.confirmedPlayers && event.confirmedPlayers.length > 0 ? (
            <div className="space-y-2">
              {event.confirmedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <span className="text-2xl font-bold text-muted-foreground w-8">#{index + 1}</span>
                  <div className="flex items-center gap-2 flex-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={player.profilePhoto || undefined}
                        alt={player.name || 'Player'}
                      />
                      <AvatarFallback className="gradient-primary text-sm">
                        {player.name
                          ? player.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)
                          : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{player.name}</span>
                  </div>
                  <span className="text-2xl font-bold text-muted-foreground">{player.rating}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">{t('noConfirmedPlayers')}</p>
          )}
        </CardContent>
      </Card>

      {/* Waitlist */}
      {event.waitlistedPlayers && event.waitlistedPlayers.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="bg-amber-50 dark:bg-amber-950/30">
            <CardTitle>
              {t('waitlist')} ({event.waitlistCount})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {event.waitlistedPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Badge variant="secondary">#{player.position}</Badge>
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={player.profilePhoto || undefined}
                        alt={player.name || 'Player'}
                      />
                      <AvatarFallback className="gradient-primary text-sm">
                        {player.name
                          ? player.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)
                          : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{player.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{player.rating}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
