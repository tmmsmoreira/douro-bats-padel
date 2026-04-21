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
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <Users className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="flex items-center gap-3 text-sm flex-1 sm:flex-none">
        <span className="whitespace-nowrap">
          <span className="font-bold text-foreground text-base tabular-nums">
            {event.confirmedCount}
          </span>
          <span className="text-muted-foreground tabular-nums">
            {' '}
            / {event.capacity} {confirmedLabel}
          </span>
        </span>
        {showProgressBar && (
          <div className="flex-1 sm:w-32 h-2 bg-muted rounded-full overflow-hidden">
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
        <span className="text-sm text-muted-foreground whitespace-nowrap tabular-nums">
          {event.waitlistCount} {waitlistedLabel}
        </span>
      )}
    </div>
  );
}
