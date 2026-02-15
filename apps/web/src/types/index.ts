export type Role = "VIEWER" | "EDITOR" | "ADMIN"
export type Tier = "MASTERS" | "EXPLORERS"
export type EventState = "DRAFT" | "OPEN" | "FROZEN" | "DRAWN" | "PUBLISHED"
export type RSVPStatus = "CONFIRMED" | "WAITLISTED" | "DECLINED" | "CANCELLED"

export interface User {
  id: string
  email: string
  name: string | null
  roles: Role[]
}

export interface PlayerProfile {
  id: string
  userId: string
  rating: number
  status: string
}

export interface Event {
  id: string
  title: string | null
  date: Date
  startsAt: Date
  endsAt: Date
  capacity: number
  state: EventState
  rsvpOpensAt: Date
  rsvpClosesAt: Date
}

export interface RSVP {
  id: string
  eventId: string
  playerId: string
  status: RSVPStatus
  position: number
  createdAt: Date
  updatedAt: Date
}
