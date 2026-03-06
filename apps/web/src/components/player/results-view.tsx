'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlayerNav } from './player-nav';
import { Footer } from '@/components/public/footer';
import { ArrowLeftIcon, ArrowLeftIconHandle } from 'lucide-animated';
import { Calendar, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import { formatDate, formatTime } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Player {
  id: string;
  name: string;
  rating: number;
}

interface Court {
  id: string;
  label: string;
}

interface Match {
  id: string;
  round: number;
  setsA: number;
  setsB: number;
  teamA: Player[];
  teamB: Player[];
  court?: Court;
  courtId?: string;
  tier?: string;
}

interface Event {
  id: string;
  title: string | null;
  date: string;
  startsAt: string;
  endsAt: string;
  venue?: {
    id: string;
    name: string;
  };
}

export function ResultsView({ eventId }: { eventId: string }) {
  const { data: session } = useSession();
  const t = useTranslations('resultsView');
  const arrowLeftIconRef = useRef<ArrowLeftIconHandle>(null);

  const { data: event, isLoading: isLoadingEvent } = useQuery<Event>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }
      const res = await fetch(`${API_URL}/events/${eventId}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch event');
      return res.json();
    },
    enabled: !!session,
  });

  const { data: matches, isLoading: isLoadingMatches } = useQuery({
    queryKey: ['matches', eventId],
    queryFn: async () => {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`;
      }
      const res = await fetch(`${API_URL}/matches/events/${eventId}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch matches');
      return res.json();
    },
    enabled: !!session,
  });

  const isLoading = isLoadingEvent || isLoadingMatches;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PlayerNav />
        <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl min-h-[500px]">
          <div className="text-center py-8">{t('loadingResults')}</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PlayerNav />
        <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl min-h-[500px]">
          <div className="text-center py-8">{t('eventNotFound')}</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PlayerNav />
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

            {/* Event Information */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{event.title || t('untitledEvent')}</h1>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatTime(event.startsAt)} - {formatTime(event.endsAt)}
                  </span>
                </div>
                {event.venue && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{event.venue.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* No Results Message */}
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {t('noResults')}
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Group by round
  const rounds = matches.reduce(
    (acc: Record<number, Match[]>, match: Match) => {
      if (!acc[match.round]) {
        acc[match.round] = [];
      }
      acc[match.round].push(match);
      return acc;
    },
    {} as Record<number, Match[]>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PlayerNav />
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

          {/* Event Information */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{event.title || t('untitledEvent')}</h1>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>
                  {formatTime(event.startsAt)} - {formatTime(event.endsAt)}
                </span>
              </div>
              {event.venue && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{event.venue.name}</span>
                </div>
              )}
            </div>
          </div>

          {(Object.entries(rounds) as [string, Match[]][]).map(([round, roundMatches]) => (
            <Card key={round}>
              <CardHeader>
                <CardTitle>{t('round', { round })}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {roundMatches.map((match: Match) => {
                    const teamAWon = match.setsA > match.setsB;
                    const teamBWon = match.setsB > match.setsA;
                    const tie = match.setsA === match.setsB;

                    return (
                      <div key={match.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline">
                            {match.court?.label || t('court', { court: match.courtId || '' })}
                          </Badge>
                          {match.tier && <Badge variant="secondary">{match.tier}</Badge>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                          <div className={`space-y-1 ${teamAWon ? 'font-bold' : ''}`}>
                            <p className="text-sm font-medium">{t('teamA')}</p>
                            {match.teamA?.map((player) => (
                              <p key={player.id} className="text-sm">
                                {player.name}
                              </p>
                            ))}
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              <span className={teamAWon ? 'text-green-600' : ''}>
                                {match.setsA}
                              </span>
                              <span className="mx-2">-</span>
                              <span className={teamBWon ? 'text-green-600' : ''}>
                                {match.setsB}
                              </span>
                            </div>
                            {tie && (
                              <p className="text-xs text-muted-foreground mt-1">{t('tie')}</p>
                            )}
                          </div>
                          <div className={`space-y-1 ${teamBWon ? 'font-bold' : ''}`}>
                            <p className="text-sm font-medium">{t('teamB')}</p>
                            {match.teamB?.map((player) => (
                              <p key={player.id} className="text-sm">
                                {player.name}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
