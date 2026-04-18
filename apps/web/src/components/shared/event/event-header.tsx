'use client';

import { Calendar, Clock, MapPin } from 'lucide-react';
import { formatDateNumeric, formatTime } from '@/lib/utils';
import { StatusBadge } from '../status-badge';
import type { EventStatus } from '../status-badge';
import { useIsMobile } from '@/hooks/use-media-query';

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
  actions?: React.ReactNode;
}

export function EventHeaderInfo({
  event,
  locale,
  showStatus = true,
  actions,
}: EventHeaderInfoProps) {
  const isMobile = useIsMobile();
  const eventDate = new Date(event.date);

  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap justify-between">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>
            {isMobile
              ? formatDateNumeric(eventDate, locale)
              : eventDate.toLocaleDateString(locale, {
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
      <div className="flex justify-between items-center gap-2 flex-1 sm:flex-none">
        {showStatus && event.state && <StatusBadge status={event.state as EventStatus} />}
        {actions}
      </div>
    </div>
  );
}
