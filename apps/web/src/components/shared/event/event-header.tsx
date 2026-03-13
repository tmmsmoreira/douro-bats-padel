'use client';

import { Calendar, Clock, MapPin } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { StatusBadge } from '../status-badge';
import type { EventStatus } from '../status-badge';

interface EventHeaderInfoProps {
  event: {
    date: string;
    startsAt: string;
    endsAt: string;
    venue?: {
      id: string;
      name: string;
    };
    state?: 'DRAFT' | 'OPEN' | 'FROZEN' | 'DRAWN' | 'PUBLISHED';
  };
  locale: string;
  showStatus?: boolean;
}

export function EventHeaderInfo({ event, locale, showStatus = true }: EventHeaderInfoProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
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
        {showStatus && event.state && <StatusBadge status={event.state as EventStatus} />}
      </div>
    </div>
  );
}
