import type { EventState, RSVPStatus } from './common';
import type { Player } from './users';

/**
 * Time slot for a tier with court assignments
 */
export interface TierTimeSlot {
  /** Start time for this tier (e.g., "20:00" for 8PM) */
  startsAt: string;
  /** End time for this tier (e.g., "21:30" for 9:30PM) */
  endsAt: string;
  /** Court IDs available for this time slot (optional for backward compatibility) */
  courtIds?: string[];
}

/**
 * Tier rules for event organization
 * Determines how players are split into MASTERS and EXPLORERS tiers
 */
export interface TierRules {
  /** Fixed number of players assigned to MASTERS tier (top-rated players) */
  masterCount?: number;
  /** Percentage of players assigned to MASTERS tier (0-100) */
  masterPercentage?: number;
  /** Time slot for MASTERS tier */
  mastersTimeSlot?: TierTimeSlot;
  /** Time slot for EXPLORERS tier */
  explorersTimeSlot?: TierTimeSlot;
}

export interface CreateEventDto {
  title?: string;
  date: Date;
  startsAt: Date;
  endsAt: Date;
  venueId: string;
  courtIds: string[];
  capacity: number;
  rsvpOpensAt: Date;
  rsvpClosesAt: Date;
  tierRules?: TierRules;
}

export interface RSVPDto {
  status: 'IN' | 'OUT';
}

export interface RSVPResponse {
  status: RSVPStatus;
  position?: number;
  message: string;
}

/**
 * Base Event entity
 */
export interface Event {
  id: string;
  title: string | null;
  date: Date;
  startsAt: Date;
  endsAt: Date;
  venueId?: string | null;
  capacity: number;
  seed?: string | null;
  rsvpOpensAt: Date;
  rsvpClosesAt: Date;
  state: EventState;
  tierRules?: TierRules | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * RSVP entity
 */
export interface RSVP {
  id: string;
  eventId: string;
  playerId: string;
  status: RSVPStatus;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Event with RSVP information
 */
export interface EventWithRSVP {
  id: string;
  title: string | null;
  date: Date;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  state: EventState;
  rsvpOpensAt: Date;
  rsvpClosesAt: Date;
  venue?: {
    id: string;
    name: string;
  };
  confirmedCount: number;
  waitlistCount: number;
  userRSVP?: {
    status: RSVPStatus;
    position: number;
  };
}

/**
 * Assignment for draw/matches
 */
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
