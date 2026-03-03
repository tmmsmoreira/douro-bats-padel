'use client';

import { motion } from 'motion/react';
import { Users } from 'lucide-react';
import type { EventWithRSVP } from '@padel/types';

interface EventStatsProps {
  event: EventWithRSVP;
  confirmedLabel?: string;
  waitlistedLabel?: string;
  showProgressBar?: boolean;
}

export function EventStats({
  event,
  confirmedLabel = 'confirmed',
  waitlistedLabel = 'waitlisted',
  showProgressBar = true,
}: EventStatsProps) {
  const percentage = (event.confirmedCount / event.capacity) * 100;

  return (
    <div className="flex items-center gap-3">
      <Users className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="flex items-center gap-3 text-sm">
        <span>
          <span className="font-bold text-foreground text-base">{event.confirmedCount}</span>
          <span className="text-muted-foreground">
            {' '}
            / {event.capacity} {confirmedLabel}
          </span>
        </span>
        {showProgressBar && (
          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full gradient-primary"
            />
          </div>
        )}
      </div>
      {event.waitlistCount > 0 && (
        <span className="text-sm text-muted-foreground">
          {event.waitlistCount} {waitlistedLabel}
        </span>
      )}
    </div>
  );
}
