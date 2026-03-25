'use client';

import { Calendar, MapPin } from 'lucide-react';
import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-media-query';

interface DrawHeaderProps {
  title: string;
  date: string;
  venue?: {
    id: string;
    name: string;
  };
  locale: string;
  actions?: ReactNode;
}

function formatDateNumeric(date: Date, locale: string): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  // Use MM/DD/YYYY for US locale, DD/MM/YYYY for others
  if (locale.startsWith('en-US')) {
    return `${month}/${day}/${year}`;
  }
  return `${day}/${month}/${year}`;
}

export function DrawHeader({ title, date, venue, locale, actions }: DrawHeaderProps) {
  const isMobile = useIsMobile();
  const eventDate = new Date(date);

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap mt-1">
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
          {venue && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{venue.name}</span>
            </div>
          )}
        </div>
      </div>
      {actions && <div className="flex gap-2 self-end sm:self-auto">{actions}</div>}
    </div>
  );
}
