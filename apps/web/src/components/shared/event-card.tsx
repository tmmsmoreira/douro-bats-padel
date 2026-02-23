import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatTime } from '@/lib/utils';
import type { EventWithRSVP } from '@padel/types';

interface EventCardProps {
  event: EventWithRSVP;
  children?: React.ReactNode;
  showVenue?: boolean;
  showStatus?: boolean;
  headerActions?: React.ReactNode;
}

export function EventCard({
  event,
  children,
  showVenue = true,
  showStatus = false,
  headerActions,
}: EventCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{event.title || 'Game Night'}</CardTitle>
            <CardDescription>
              {formatDate(event.date)} • {formatTime(event.startsAt)} - {formatTime(event.endsAt)}
            </CardDescription>
            {showVenue && event.venue && (
              <p className="text-sm text-muted-foreground mt-1">{event.venue.name}</p>
            )}
          </div>
          {showStatus && (
            <Badge variant={event.state === 'PUBLISHED' ? 'default' : 'secondary'}>
              {event.state}
            </Badge>
          )}
          {headerActions}
        </div>
      </CardHeader>
      {children && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}
