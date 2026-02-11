import type { EventState, RSVPStatus } from "./common"

export interface CreateEventDto {
  title?: string
  date: Date
  startsAt: Date
  endsAt: Date
  venueId: string
  courtIds: string[]
  capacity: number
  rsvpOpensAt: Date
  rsvpClosesAt: Date
  tierRules?: Record<string, any>
}

export interface RSVPDto {
  status: "IN" | "OUT"
}

export interface RSVPResponse {
  status: RSVPStatus
  position?: number
  message: string
}

export interface EventWithRSVP {
  id: string
  title: string | null
  date: Date
  startsAt: Date
  endsAt: Date
  capacity: number
  state: EventState
  rsvpOpensAt: Date
  rsvpClosesAt: Date
  venue?: {
    id: string
    name: string
  }
  confirmedCount: number
  waitlistCount: number
  userRSVP?: {
    status: RSVPStatus
    position: number
  }
}
