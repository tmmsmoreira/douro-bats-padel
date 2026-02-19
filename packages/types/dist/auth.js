"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationStatus = void 0;
// Invitation types
var InvitationStatus;
(function (InvitationStatus) {
    InvitationStatus["PENDING"] = "PENDING";
    InvitationStatus["ACCEPTED"] = "ACCEPTED";
    InvitationStatus["REVOKED"] = "REVOKED";
    InvitationStatus["EXPIRED"] = "EXPIRED";
})(InvitationStatus || (exports.InvitationStatus = InvitationStatus = {}));
