import type { Assignment } from '@padel/types';

/**
 * Group assignments by round number
 */
export function groupByRound(assignments: Assignment[]): Record<number, Assignment[]> {
  return assignments.reduce(
    (acc, assignment) => {
      if (!acc[assignment.round]) {
        acc[assignment.round] = [];
      }
      acc[assignment.round].push(assignment);
      return acc;
    },
    {} as Record<number, Assignment[]>
  );
}

/**
 * Get count of unique teams in assignments
 */
export function getUniqueTeamsCount(assignments: Assignment[]): number {
  const teamSet = new Set<string>();
  assignments.forEach((assignment) => {
    const teamAKey = assignment.teamA
      .map((p) => p.id)
      .sort()
      .join('-');
    const teamBKey = assignment.teamB
      .map((p) => p.id)
      .sort()
      .join('-');
    teamSet.add(teamAKey);
    teamSet.add(teamBKey);
  });
  return teamSet.size;
}

/**
 * Get count of unique courts/fields in assignments
 */
export function getFieldsCount(assignments: Assignment[]): number {
  const fields = new Set(assignments.map((a) => a.courtId));
  return fields.size;
}

/**
 * Filter assignments by tier
 */
export function filterByTier(
  assignments: Assignment[],
  tier: 'MASTERS' | 'EXPLORERS'
): Assignment[] {
  return assignments.filter((a) => a.tier === tier);
}

/**
 * Get all unique players from assignments
 */
export function getUniquePlayers(assignments: Assignment[]): Assignment['teamA'] {
  return assignments
    .flatMap((a) => [...a.teamA, ...a.teamB])
    .filter((player, index, self) => self.findIndex((p) => p.id === player.id) === index);
}

/**
 * Check if event has passed
 */
export function hasEventPassed(endsAt: string | Date): boolean {
  const eventEndTime = new Date(endsAt);
  return eventEndTime < new Date();
}
