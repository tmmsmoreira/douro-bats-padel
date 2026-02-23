import type { EventWithRSVP } from '@padel/types';

interface EventStatsProps {
  event: EventWithRSVP;
  confirmedLabel?: string;
  waitlistedLabel?: string;
}

export function EventStats({
  event,
  confirmedLabel = 'confirmed',
  waitlistedLabel = 'waitlisted',
}: EventStatsProps) {
  return (
    <div className="flex flex-wrap gap-3 sm:gap-4 text-sm">
      <span>
        <strong>{event.confirmedCount}</strong> / {event.capacity} {confirmedLabel}
      </span>
      {event.waitlistCount > 0 && (
        <span className="text-muted-foreground">
          {event.waitlistCount} {waitlistedLabel}
        </span>
      )}
    </div>
  );
}
