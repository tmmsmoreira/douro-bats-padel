'use client';

import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatTime } from '@/lib/utils';
import { Clock, MapPin, Calendar } from 'lucide-react';
import type { EventWithRSVP } from '@padel/types';
import { useLocale } from 'next-intl';

interface EventCardProps {
  event: EventWithRSVP;
  children?: React.ReactNode;
  showVenue?: boolean;
  showStatus?: boolean;
  headerActions?: React.ReactNode;
  animate?: boolean;
}

export function EventCard({
  event,
  children,
  showVenue = true,
  headerActions,
  animate = false,
}: EventCardProps) {
  const locale = useLocale();

  const cardContent = (
    <Card className="glass-card group hover:shadow-xl transition-all duration-300 border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
            {event.title || 'Game Night'}
          </CardTitle>
          {/* Show headerActions on desktop only, aligned with title */}
          <div className="hidden sm:block">{headerActions}</div>
        </div>
        <div className="flex items-start justify-between gap-4 mt-3">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-4 gap-y-2 text-sm text-muted-foreground flex-1 min-w-0">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>{formatDate(event.date, locale)}</span>
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span>
                {formatTime(event.startsAt, locale)} - {formatTime(event.endsAt, locale)}
              </span>
            </span>
            {showVenue && event.venue && (
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{event.venue.name}</span>
              </span>
            )}
          </div>
          {/* Show headerActions on mobile only, aligned with date/time/location */}
          <div className="sm:hidden">{headerActions}</div>
        </div>
      </CardHeader>
      {children && <CardContent className="pt-0 pb-6">{children}</CardContent>}
    </Card>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ y: -2 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}
