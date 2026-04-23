export declare enum Role {
    VIEWER = "VIEWER",
    ADMIN = "ADMIN"
}
export declare enum Tier {
    MASTERS = "MASTERS",
    EXPLORERS = "EXPLORERS"
}
export declare enum EventState {
    DRAFT = "DRAFT",
    OPEN = "OPEN",
    FROZEN = "FROZEN",
    DRAWN = "DRAWN",
    PUBLISHED = "PUBLISHED"
}
export declare enum RSVPStatus {
    CONFIRMED = "CONFIRMED",
    WAITLISTED = "WAITLISTED",
    DECLINED = "DECLINED",
    CANCELLED = "CANCELLED"
}
export declare enum PlayerStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    INVITED = "INVITED",
    /**
     * Set when a user has been anonymized (GDPR-style soft-delete). Their PII
     * on User is scrubbed but PlayerProfile and historical ranking data
     * (WeeklyScore, RankingSnapshot) remain so leaderboards stay consistent.
     * DELETED players are hidden from leaderboards and player-history queries.
     */
    DELETED = "DELETED"
}
export declare enum EventFormat {
    NON_STOP = "NON_STOP"
}
export declare enum Locale {
    EN = "EN",
    PT = "PT"
}
//# sourceMappingURL=common.d.ts.map