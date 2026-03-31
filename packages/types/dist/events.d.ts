import type { EventState, RSVPStatus, EventFormat } from './common';
import type { Player, WaitlistedPlayer } from './users';
/**
 * Time slot for a tier with court assignments
 */
export interface TierTimeSlot {
    startsAt: string;
    endsAt: string;
    courtIds?: string[];
}
/**
 * Tier rules for event organization
 * Determines how players are split into MASTERS and EXPLORERS tiers
 */
export interface TierRules {
    masterCount?: number;
    masterPercentage?: number;
    mastersTimeSlot?: TierTimeSlot;
    explorersTimeSlot?: TierTimeSlot;
}
export interface CreateEventDto {
    title?: string;
    date: Date;
    startsAt: Date;
    endsAt: Date;
    format?: EventFormat;
    duration?: number;
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
    format: EventFormat;
    duration?: number | null;
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
    format: EventFormat;
    duration?: number | null;
    venueId?: string | null;
    capacity: number;
    state: EventState;
    rsvpOpensAt: Date;
    rsvpClosesAt: Date;
    tierRules?: TierRules | null;
    venue?: {
        id: string;
        name: string;
    };
    courtIds?: string[];
    confirmedCount: number;
    waitlistCount: number;
    userRSVP?: {
        status: RSVPStatus;
        position: number;
    };
}
/**
 * Event with RSVP information and player lists
 * Used for detailed event views that show confirmed and waitlisted players
 */
export interface EventWithPlayers extends EventWithRSVP {
    confirmedPlayers: Player[];
    waitlistedPlayers: WaitlistedPlayer[];
}
/**
 * Serialized version of EventWithRSVP (as returned from API)
 * Dates are serialized as strings when returned from API
 */
export type EventWithRSVPSerialized = Omit<EventWithRSVP, 'date' | 'startsAt' | 'endsAt' | 'rsvpOpensAt' | 'rsvpClosesAt'> & {
    date: string;
    startsAt: string;
    endsAt: string;
    rsvpOpensAt: string;
    rsvpClosesAt: string;
};
/**
 * Serialized version of EventWithPlayers (as returned from API)
 * Dates are serialized as strings when returned from API
 */
export type EventWithPlayersSerialized = Omit<EventWithPlayers, 'date' | 'startsAt' | 'endsAt' | 'rsvpOpensAt' | 'rsvpClosesAt'> & {
    date: string;
    startsAt: string;
    endsAt: string;
    rsvpOpensAt: string;
    rsvpClosesAt: string;
};
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
//# sourceMappingURL=events.d.ts.map