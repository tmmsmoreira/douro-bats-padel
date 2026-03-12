export interface Player {
  id: string;
  name: string;
  rating: number;
  tier: string;
  profilePhoto?: string | null;
}

export interface WaitlistedPlayer extends Player {
  position: number;
}

export interface Assignment {
  id: string;
  round: number;
  courtId: string;
  tier: string;
  court?: {
    id: string;
    label: string;
  };
  teamA: Player[];
  teamB: Player[];
}

export interface TierTimeSlot {
  startsAt: string;
  endsAt: string;
  courtIds?: string[];
}

export interface TierRules {
  masterCount?: number;
  masterPercentage?: number;
  mastersTimeSlot?: TierTimeSlot;
  explorersTimeSlot?: TierTimeSlot;
}

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
