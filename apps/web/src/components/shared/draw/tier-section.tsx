import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { useLocale } from 'next-intl';
import { MatchAssignment } from './match-assignment';
import type { Assignment, TierTimeSlot } from './types';
import { formatTimeSlot } from '@/lib/utils';

interface TierSectionProps {
  tier: 'MASTERS' | 'EXPLORERS';
  rounds: Record<number, Assignment[]>;
  timeSlot?: TierTimeSlot;
  eventDate?: string | Date;
  onEditAssignment?: (assignmentId: string) => void;
  canEdit?: boolean;
  translations: {
    tierName: string;
    round: (round: number) => string;
    courtLabel: (courtId: string) => string;
  };
}

export function TierSection({
  tier,
  rounds,
  timeSlot,
  eventDate,
  onEditAssignment,
  canEdit,
  translations,
}: TierSectionProps) {
  const locale = useLocale();
  const tierBadgeClass =
    tier === 'MASTERS' ? 'bg-yellow-50 dark:bg-yellow-950/30' : 'bg-blue-50 dark:bg-blue-950/30';

  const tierIndicatorClass =
    tier === 'MASTERS' ? 'w-2 h-6 bg-yellow-500 rounded-full' : 'w-2 h-6 bg-blue-500 rounded-full';

  if (Object.keys(rounds).length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className={tierIndicatorClass}></div>
        <h2 className="text-2xl font-bold">{translations.tierName}</h2>
        {timeSlot && eventDate && (
          <Badge variant="secondary" className="text-sm">
            <Clock className="mr-2 h-4 w-4" />{' '}
            {formatTimeSlot(timeSlot.startsAt, eventDate, locale)} -{' '}
            {formatTimeSlot(timeSlot.endsAt, eventDate, locale)}
          </Badge>
        )}
      </div>

      {Object.entries(rounds)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([round, assignments]) => (
          <Card key={`${tier}-${round}`} className="glass-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">{translations.round(Number(round))}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-1 gap-2">
                {assignments.map((assignment) => (
                  <MatchAssignment
                    key={assignment.id}
                    assignment={assignment}
                    onEdit={onEditAssignment}
                    canEdit={canEdit}
                    courtLabel={translations.courtLabel}
                    tierLabel={tier}
                    tierBadgeClass={tierBadgeClass}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
