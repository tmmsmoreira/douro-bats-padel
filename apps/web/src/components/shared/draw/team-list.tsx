import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import type { Assignment } from './types';
import { SquarePenIcon, SquarePenIconHandle } from 'lucide-animated';
import { useMemo } from 'react';

interface Team {
  id: string;
  player1: { id: string; name: string; rating: number; profilePhoto?: string | null };
  player2: { id: string; name: string; rating: number; profilePhoto?: string | null };
  avgRating: number;
}

interface TeamListProps {
  assignments: Assignment[];
  onEditTeam?: (team: Team, assignmentIds: string[], teamNumber: number) => void;
  canEdit?: boolean;
  translations: {
    tierName: string;
    teamListTitle: string;
    teamListDescription: string;
    team: string;
    avgRating: string;
  };
}

export function TeamList({ assignments, onEditTeam, canEdit, translations }: TeamListProps) {
  const getPlayerInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Extract all unique teams from assignments
  const teams = useMemo(() => {
    const teamsMap = new Map<string, { team: Team; assignmentIds: string[] }>();

    assignments.forEach((assignment) => {
      // Process Team A
      if (assignment.teamA.length === 2) {
        const [p1, p2] = assignment.teamA;
        const teamKey = [p1.id, p2.id].sort().join('-');

        if (!teamsMap.has(teamKey)) {
          teamsMap.set(teamKey, {
            team: {
              id: teamKey,
              player1: p1,
              player2: p2,
              avgRating: (p1.rating + p2.rating) / 2,
            },
            assignmentIds: [],
          });
        }
        teamsMap.get(teamKey)!.assignmentIds.push(assignment.id);
      }

      // Process Team B
      if (assignment.teamB.length === 2) {
        const [p1, p2] = assignment.teamB;
        const teamKey = [p1.id, p2.id].sort().join('-');

        if (!teamsMap.has(teamKey)) {
          teamsMap.set(teamKey, {
            team: {
              id: teamKey,
              player1: p1,
              player2: p2,
              avgRating: (p1.rating + p2.rating) / 2,
            },
            assignmentIds: [],
          });
        }
        teamsMap.get(teamKey)!.assignmentIds.push(assignment.id);
      }
    });

    return Array.from(teamsMap.values());
  }, [assignments]);

  // Create a ref for each team's edit button
  const teamRefs = useMemo(
    () => teams.map(() => ({ current: null as SquarePenIconHandle | null })),
    [teams]
  );

  if (teams.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            {translations.teamListTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(({ team, assignmentIds }, index) => (
              <div key={team.id} className="bg-muted/50 rounded-lg p-4 space-y-3 border">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground text-center uppercase font-semibold">
                    {translations.team} {index + 1}
                  </div>
                  {canEdit && onEditTeam && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditTeam(team, assignmentIds, index + 1)}
                      title="Edit team members"
                      onMouseEnter={() => teamRefs[index].current?.startAnimation()}
                      onMouseLeave={() => teamRefs[index].current?.stopAnimation()}
                    >
                      <SquarePenIcon ref={teamRefs[index]} className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {[team.player1, team.player2].map((player) => (
                    <div key={player.id} className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={player.profilePhoto || undefined} alt={player.name} />
                        <AvatarFallback className="gradient-primary text-xs">
                          {getPlayerInitials(player.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium flex-1">{player.name}</span>
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {player.rating}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t text-sm text-muted-foreground">
                  {translations.avgRating}: {team.avgRating.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
