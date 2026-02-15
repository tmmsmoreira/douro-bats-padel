"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RSVPStatus = exports.EventState = exports.Tier = exports.Role = void 0;
var Role;
(function (Role) {
    Role["VIEWER"] = "VIEWER";
    Role["EDITOR"] = "EDITOR";
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
})(EventState || (exports.EventState = EventState = {}));
var RSVPStatus;
(function (RSVPStatus) {
    RSVPStatus["CONFIRMED"] = "CONFIRMED";
    RSVPStatus["WAITLISTED"] = "WAITLISTED";
    RSVPStatus["DECLINED"] = "DECLINED";
    RSVPStatus["CANCELLED"] = "CANCELLED";
})(RSVPStatus || (exports.RSVPStatus = RSVPStatus = {}));
