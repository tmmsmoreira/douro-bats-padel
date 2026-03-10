'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowLeftIcon, ArrowLeftIconHandle, ClockIcon } from 'lucide-animated';
import { Calendar, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HomeAdaptiveNav } from '@/components/shared/home-adaptive-nav';
import { Footer } from '@/components/public/footer';
import { useRef } from 'react';
import { formatTime } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Player {
  id: string;
  name: string;
  rating: number;
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
}

export function EventDetails({ eventId }: { eventId: string }) {
  const { data: session } = useSession();
  const t = useTranslations('eventDetails');
  const locale = useLocale();

  const {
    data: event,
    isLoading,
    error,
  } = useQuery<EventDetails>({
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

  const arrowLeftIconRef = useRef<ArrowLeftIconHandle>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <HomeAdaptiveNav />
        <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
          <div className="text-center py-8">{t('loadingEvent')}</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <HomeAdaptiveNav />
        <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl min-h-[500px]">
          <div className="text-center py-8">{t('eventNotFound')}</div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show message for published events
  if (event.state === 'PUBLISHED') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <HomeAdaptiveNav />
        <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl min-h-[500px]">
          <div className="space-y-6">
            {/* Back Button */}
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                onMouseEnter={() => arrowLeftIconRef.current?.startAnimation()}
              >
                <ArrowLeftIcon ref={arrowLeftIconRef} size={16} />
                {t('backToEvents')}
              </Button>
            </Link>

            {/* Message Card */}
            <Card className="glass-card mt-4">
              <CardContent className="pt-6 pb-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{event.title || t('untitledEvent')}</h2>
                    <p className="text-muted-foreground">
                      {new Date(event.date).toLocaleDateString(locale, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="pt-4">
                    <p className="text-lg mb-6">{t('drawPublishedMessage')}</p>
                    <Link href={`/events/${eventId}/draw`}>
                      <Button size="lg" className="w-full sm:w-auto">
                        {t('viewDraw')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const spotsRemaining = event.capacity - event.confirmedCount;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HomeAdaptiveNav />
      <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl min-h-[500px]">
        <div className="space-y-6">
          {/* Back Button */}
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              onMouseEnter={() => arrowLeftIconRef.current?.startAnimation()}
              onMouseLeave={() => arrowLeftIconRef.current?.stopAnimation()}
            >
              <ArrowLeftIcon ref={arrowLeftIconRef} size={16} />
              {t('backToEvents')}
            </Button>
          </Link>

          {/* Event Header */}
          <div className="text-center space-y-4 mt-4">
            <h1 className="text-3xl font-bold mb-2">{event.title || t('untitledEvent')}</h1>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
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

            {/* Tier Time Slots */}
            {event.tierRules &&
              (event.tierRules.mastersTimeSlot || event.tierRules.explorersTimeSlot) && (
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {event.tierRules.mastersTimeSlot && (
                    <Badge
                      variant="outline"
                      className="text-sm px-3 py-1 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800"
                    >
                      <ClockIcon className="mr-2 h-3 w-3" />
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
                      <ClockIcon className="mr-2 h-3 w-3" />
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
          <Card>
            <CardHeader className="bg-green-50 dark:bg-green-950/30">
              <div className="flex items-center justify-between">
                <CardTitle>
                  {t('confirmedPlayers')} ({event.confirmedCount}/{event.capacity})
                </CardTitle>
                {spotsRemaining > 0 ? (
                  <Badge variant="secondary">
                    {t('spotsRemaining', { count: spotsRemaining })}
                  </Badge>
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
                      <span className="text-2xl font-bold text-muted-foreground w-8">
                        #{index + 1}
                      </span>
                      <span>{player.name}</span>
                      <span className="text-2xl font-bold text-muted-foreground">
                        {player.rating}
                      </span>
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
            <Card>
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
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">#{player.position}</Badge>
                        <span>{player.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{player.rating}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
