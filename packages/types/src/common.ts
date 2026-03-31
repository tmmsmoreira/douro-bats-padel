export enum Role {
  VIEWER = 'VIEWER',
  EDITOR = 'EDITOR',
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
}

export enum EventFormat {
  NON_STOP = 'NON_STOP',
}
