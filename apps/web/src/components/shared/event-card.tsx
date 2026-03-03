'use client';

import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatTime } from '@/lib/utils';
import { Clock, MapPin } from 'lucide-react';
import type { EventWithRSVP } from '@padel/types';

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
  showStatus = false,
  headerActions,
  animate = false,
}: EventCardProps) {
  const cardContent = (
    <Card className="glass-card group hover:shadow-xl transition-all duration-300 border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
              {event.title || 'Game Night'}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {formatDate(event.date)} • {formatTime(event.startsAt)} -{' '}
                  {formatTime(event.endsAt)}
                </span>
              </span>
              {showVenue && event.venue && (
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="truncate">{event.venue.name}</span>
                </span>
              )}
            </div>
          </div>
          {headerActions}
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
