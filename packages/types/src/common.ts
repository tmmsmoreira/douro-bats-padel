export enum Role {
  VIEWER = 'VIEWER',
  ADMIN = 'ADMIN',
}

export enum Tier {
  MASTERS = 'MASTERS',
  EXPLORERS = 'EXPLORERS',
}

export enum EventState {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  FROZEN = 'FROZEN',
  DRAWN = 'DRAWN',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
}

export enum RSVPStatus {
  CONFIRMED = 'CONFIRMED',
  WAITLISTED = 'WAITLISTED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED',
}

export enum PlayerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  INVITED = 'INVITED',
  /**
   * Set when a user has been anonymized (GDPR-style soft-delete). Their PII
   * on User is scrubbed but PlayerProfile and historical ranking data
   * (WeeklyScore, RankingSnapshot) remain so leaderboards stay consistent.
   * DELETED players are hidden from leaderboards and player-history queries.
   */
  DELETED = 'DELETED',
}

export enum EventFormat {
  NON_STOP = 'NON_STOP',
}

export enum Locale {
  EN = 'EN',
  PT = 'PT',
}
