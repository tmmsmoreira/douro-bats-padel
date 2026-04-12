'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import type { Match } from '@/hooks/use-matches';

interface TeamStanding {
  teamKey: string;
  teamLabel: string;
  players: Array<{ id: string; name: string; profilePhoto?: string | null }>;
  roundPoints: Record<number, number>;
  totalPoints: number;
  gamesWon: number;
  gamesLost: number;
  diff: number;
  rank: number;
}

interface TierClassificationTableProps {
  matches: Match[];
  translations: {
    classification: string;
    team: string;
    roundAbbr: (round: number) => string;
    total: string;
    gamesWon: string;
    gamesLost: string;
    diff: string;
    rank: string;
  };
}

function getTeamKey(players: Array<{ id: string }>): string {
  return [...players]
    .map((p) => p.id)
    .sort()
    .join('-');
}

function getPlayerInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const TEAM_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function TierClassificationTable({ matches, translations }: TierClassificationTableProps) {
  const { standings, rounds } = useMemo(() => {
    const teamMap = new Map<string, TeamStanding>();
    const teamOrder: string[] = [];
    const roundSet = new Set<number>();

    for (const match of matches) {
      if (!match.teamA?.length || !match.teamB?.length) continue;

      roundSet.add(match.round);

      const teamAKey = getTeamKey(match.teamA);
      const teamBKey = getTeamKey(match.teamB);

      // Initialize teams if not present, tracking insertion order for labels
      if (!teamMap.has(teamAKey)) {
        teamOrder.push(teamAKey);
        teamMap.set(teamAKey, {
          teamKey: teamAKey,
          teamLabel: `${translations.team} ${TEAM_LETTERS[teamOrder.length - 1] || teamOrder.length}`,
          players: match.teamA.map((p) => ({
            id: p.id,
            name: p.name,
            profilePhoto: p.profilePhoto,
          })),
          roundPoints: {},
          totalPoints: 0,
          gamesWon: 0,
          gamesLost: 0,
          diff: 0,
          rank: 0,
        });
      }
      if (!teamMap.has(teamBKey)) {
        teamOrder.push(teamBKey);
        teamMap.set(teamBKey, {
          teamKey: teamBKey,
          teamLabel: `${translations.team} ${TEAM_LETTERS[teamOrder.length - 1] || teamOrder.length}`,
          players: match.teamB.map((p) => ({
            id: p.id,
            name: p.name,
            profilePhoto: p.profilePhoto,
          })),
          roundPoints: {},
          totalPoints: 0,
          gamesWon: 0,
          gamesLost: 0,
          diff: 0,
          rank: 0,
        });
      }

      const teamA = teamMap.get(teamAKey)!;
      const teamB = teamMap.get(teamBKey)!;

      // Calculate round points (3 for win, 1 for tie, 0 for loss)
      let pointsA = 0;
      let pointsB = 0;
      if (match.setsA > match.setsB) {
        pointsA = 3;
      } else if (match.setsB > match.setsA) {
        pointsB = 3;
      } else {
        pointsA = 1;
        pointsB = 1;
      }

      teamA.roundPoints[match.round] = (teamA.roundPoints[match.round] || 0) + pointsA;
      teamB.roundPoints[match.round] = (teamB.roundPoints[match.round] || 0) + pointsB;

      // Accumulate games
      teamA.gamesWon += match.setsA;
      teamA.gamesLost += match.setsB;
      teamB.gamesWon += match.setsB;
      teamB.gamesLost += match.setsA;
    }

    // Calculate totals
    for (const team of teamMap.values()) {
      team.totalPoints = Object.values(team.roundPoints).reduce((sum, pts) => sum + pts, 0);
      team.diff = team.gamesWon - team.gamesLost;
    }

    // Sort: total points DESC, then diff DESC, then games won DESC
    const sorted = [...teamMap.values()].sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.diff !== a.diff) return b.diff - a.diff;
      return b.gamesWon - a.gamesWon;
    });

    // Assign ranks
    sorted.forEach((team, i) => {
      team.rank = i + 1;
    });

    const sortedRounds = [...roundSet].sort((a, b) => a - b);

    return { standings: sorted, rounds: sortedRounds };
  }, [matches, translations.team]);

  if (standings.length === 0) return null;

  const rankColors: Record<number, string> = {
    1: 'bg-yellow-500 text-white',
    2: 'bg-gray-400 text-white',
    3: 'bg-amber-700 text-white',
  };

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5" />
          {translations.classification}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-center py-2 px-2 font-medium w-8">{translations.rank}</th>
                <th className="text-left py-2 px-2 font-medium">{translations.team}</th>
                {rounds.map((round) => (
                  <th key={round} className="text-center py-2 px-2 font-medium whitespace-nowrap">
                    {translations.roundAbbr(round)}
                  </th>
                ))}
                <th className="text-center py-2 px-2 font-medium">{translations.total}</th>
                <th className="text-center py-2 px-2 font-medium">{translations.gamesWon}</th>
                <th className="text-center py-2 px-2 font-medium">{translations.gamesLost}</th>
                <th className="text-center py-2 px-2 font-medium">{translations.diff}</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team) => (
                <tr key={team.teamKey} className="border-b last:border-0">
                  <td className="text-center py-3 px-2">
                    <Badge
                      variant={team.rank <= 3 ? 'default' : 'secondary'}
                      className={`text-xs font-bold w-6 h-6 p-0 flex items-center justify-center ${rankColors[team.rank] || ''}`}
                    >
                      {team.rank}
                    </Badge>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex -space-x-2 shrink-0">
                        {team.players.map((player) => (
                          <Avatar key={player.id} className="h-6 w-6 border-2 border-background">
                            <AvatarImage
                              src={player.profilePhoto || undefined}
                              alt={player.name || 'Player'}
                            />
                            <AvatarFallback className="gradient-primary text-[10px]">
                              {player.name ? getPlayerInitials(player.name) : '?'}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="font-medium truncate">{team.teamLabel}</span>
                    </div>
                  </td>
                  {rounds.map((round) => (
                    <td key={round} className="text-center py-3 px-2 tabular-nums">
                      {team.roundPoints[round] ?? 0}
                    </td>
                  ))}
                  <td className="text-center py-3 px-2 font-bold tabular-nums">
                    {team.totalPoints}
                  </td>
                  <td className="text-center py-3 px-2 tabular-nums">{team.gamesWon}</td>
                  <td className="text-center py-3 px-2 tabular-nums">{team.gamesLost}</td>
                  <td
                    className={`text-center py-3 px-2 font-semibold tabular-nums ${
                      team.diff > 0 ? 'text-green-600' : team.diff < 0 ? 'text-red-500' : ''
                    }`}
                  >
                    {team.diff > 0 ? `+${team.diff}` : team.diff}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
