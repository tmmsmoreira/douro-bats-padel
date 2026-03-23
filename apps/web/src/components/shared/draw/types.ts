// Import and re-export types from shared package
import type { Player, WaitlistedPlayer, Assignment, TierTimeSlot, TierRules } from '@padel/types';

export type { Player, WaitlistedPlayer, Assignment, TierTimeSlot, TierRules };

export interface Draw {
  id: string;
  eventId: string;
  event: {
    id: string;
    title: string;
    date: string;
    startsAt: string;
    endsAt: string;
    state?: string;
    venue?: {
      id: string;
      name: string;
      courts: Array<{
        id: string;
        label: string;
      }>;
    };
    tierRules?: TierRules;
  };
  assignments: Assignment[];
}
