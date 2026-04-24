"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Locale = exports.EventFormat = exports.PlayerStatus = exports.RSVPStatus = exports.EventState = exports.Tier = exports.Role = void 0;
var Role;
(function (Role) {
    Role["VIEWER"] = "VIEWER";
    Role["ADMIN"] = "ADMIN";
})(Role || (exports.Role = Role = {}));
var Tier;
(function (Tier) {
    Tier["MASTERS"] = "MASTERS";
    Tier["EXPLORERS"] = "EXPLORERS";
})(Tier || (exports.Tier = Tier = {}));
var EventState;
(function (EventState) {
    EventState["DRAFT"] = "DRAFT";
    EventState["OPEN"] = "OPEN";
    EventState["FROZEN"] = "FROZEN";
    EventState["DRAWN"] = "DRAWN";
    EventState["PUBLISHED"] = "PUBLISHED";
    EventState["CANCELLED"] = "CANCELLED";
})(EventState || (exports.EventState = EventState = {}));
var RSVPStatus;
(function (RSVPStatus) {
    RSVPStatus["CONFIRMED"] = "CONFIRMED";
    RSVPStatus["WAITLISTED"] = "WAITLISTED";
    RSVPStatus["DECLINED"] = "DECLINED";
    RSVPStatus["CANCELLED"] = "CANCELLED";
})(RSVPStatus || (exports.RSVPStatus = RSVPStatus = {}));
var PlayerStatus;
(function (PlayerStatus) {
    PlayerStatus["ACTIVE"] = "ACTIVE";
    PlayerStatus["INACTIVE"] = "INACTIVE";
    PlayerStatus["INVITED"] = "INVITED";
    /**
     * Set when a user has been anonymized (GDPR-style soft-delete). Their PII
     * on User is scrubbed but PlayerProfile and historical ranking data
     * (WeeklyScore, RankingSnapshot) remain so leaderboards stay consistent.
     * DELETED players are hidden from leaderboards and player-history queries.
     */
    PlayerStatus["DELETED"] = "DELETED";
})(PlayerStatus || (exports.PlayerStatus = PlayerStatus = {}));
var EventFormat;
(function (EventFormat) {
    EventFormat["NON_STOP"] = "NON_STOP";
})(EventFormat || (exports.EventFormat = EventFormat = {}));
var Locale;
(function (Locale) {
    Locale["EN"] = "EN";
    Locale["PT"] = "PT";
})(Locale || (exports.Locale = Locale = {}));
