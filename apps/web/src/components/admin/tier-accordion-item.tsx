import { Badge } from '@/components/ui/badge';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Clock } from 'lucide-react';
import { TierSection, TeamList } from '@/components/shared/draw';
import type { Assignment, TierTimeSlot } from '@/components/shared/draw';

interface Team {
  id: string;
  player1: { id: string; name: string; rating: number; profilePhoto?: string | null };
  player2: { id: string; name: string; rating: number; profilePhoto?: string | null };
  avgRating: number;
}

interface TierAccordionItemProps {
  value: string;
  tier: 'MASTERS' | 'EXPLORERS';
  tierName: string;
  assignments: Assignment[];
  rounds: Record<number, Assignment[]>;
  timeSlot?: TierTimeSlot;
  eventDate: string;
  teamsCount: number;
  fieldsCount: number;
  canEdit: boolean;
  onEditTeam: (team: Team, assignmentIds: string[]) => void;
  tierColor?: string;
  translations: {
    tierName: string;
    teamListTitle: string;
    teamListDescription: string;
    team: string;
    avgRating: string;
    teams: string;
    rounds: string;
    fields: string;
    timeSlot?: string;
    round: (round: number) => string;
    courtLabel: (courtId: string) => string;
  };
}

export function TierAccordionItem({
  value,
  tier,
  tierName,
  assignments,
  rounds,
  timeSlot,
  eventDate,
  teamsCount,
  fieldsCount,
  canEdit,
  onEditTeam,
  tierColor,
  translations: t,
}: TierAccordionItemProps) {
  if (assignments.length === 0) return null;

  return (
    <AccordionItem value={value} className="border rounded-lg glass-card">
      <AccordionTrigger className="px-6 hover:no-underline">
        <div className="flex flex-col gap-3 w-full pr-2">
          {/* Row 1: Tier Title + Time Slot */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              {tierColor && <div className={`w-2 h-6 ${tierColor} rounded-full`} />}
              <h2 className="text-xl sm:text-2xl font-bold">{tierName}</h2>
            </div>

            {/* Time Slot - Always on first row */}
            {timeSlot && t.timeSlot && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="font-medium whitespace-nowrap">
                  {timeSlot.startsAt} - {timeSlot.endsAt}
                </span>
              </div>
            )}
          </div>

          {/* Row 2: Badges */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground pl-5">
            <Badge variant="secondary">
              {teamsCount} {t.teams}
            </Badge>
            <Badge variant="secondary">
              {Object.keys(rounds).length} {t.rounds}
            </Badge>
            <Badge variant="secondary">
              {fieldsCount} {t.fields}
            </Badge>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-6">
          {/* Team List */}
          <TeamList
            assignments={assignments}
            onEditTeam={onEditTeam}
            canEdit={canEdit}
            translations={{
              tierName: t.tierName,
              teamListTitle: t.teamListTitle,
              teamListDescription: t.teamListDescription,
              team: t.team,
              avgRating: t.avgRating,
            }}
          />

          {/* Rounds */}
          <TierSection
            tier={tier}
            rounds={rounds}
            assignments={assignments}
            timeSlot={timeSlot}
            eventDate={eventDate}
            translations={{
              tierName: t.tierName,
              round: t.round,
              courtLabel: t.courtLabel,
              team: t.team,
            }}
            canEdit={false}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
