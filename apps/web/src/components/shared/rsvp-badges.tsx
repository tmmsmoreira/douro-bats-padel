import { Badge } from '@/components/ui/badge';
import type { EventWithRSVP } from '@padel/types';

interface RSVPBadgesProps {
  event: EventWithRSVP;
  confirmedText?: string;
  waitlistText?: string;
}

export function RSVPBadges({
  event,
  confirmedText = 'Confirmed',
  waitlistText = 'Waitlist',
}: RSVPBadgesProps) {
  const userStatus = event.userRSVP?.status;
  const isConfirmed = userStatus === 'CONFIRMED';
  const isWaitlisted = userStatus === 'WAITLISTED';

  if (!isConfirmed && !isWaitlisted) {
    return null;
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {isConfirmed && (
        <Badge variant="default" className="uppercase">
          {confirmedText}
        </Badge>
      )}
      {isWaitlisted && (
        <Badge variant="secondary" className="uppercase">
          {waitlistText} #{event.userRSVP?.position || 0}
        </Badge>
      )}
    </div>
  );
}
