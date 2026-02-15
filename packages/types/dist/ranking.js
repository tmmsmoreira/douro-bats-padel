"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toTier = void 0;
exports.computeRanking = computeRanking;
const common_1 = require("./common");
const CONFIG = {
    MASTERS: { base: 300, perSet: 20 },
    EXPLORERS: { base: 200, perSet: 15 },
};
function computeRanking(i) {
    const raw = {};
    const rounds = {};
    const add = (p, v) => (raw[p] = (raw[p] || 0) + v);
    const inc = (p) => (rounds[p] = (rounds[p] || 0) + 1);
    for (const m of i.matches) {
        const tie = m.setsA === m.setsB;
        const cfg = CONFIG[m.tier];
        if (tie) {
            const ptsA = cfg.perSet * m.setsA;
            const ptsB = cfg.perSet * m.setsB;
            m.teamA.forEach((p) => add(p, ptsA / 2));
            m.teamB.forEach((p) => add(p, ptsB / 2));
            [...m.teamA, ...m.teamB].forEach(inc);
            continue;
        }
        const aWin = m.setsA > m.setsB;
        const setsW = aWin ? m.setsA : m.setsB;
        const setsL = aWin ? m.setsB : m.setsA;
        const winner = aWin ? m.teamA : m.teamB;
        const loser = aWin ? m.teamB : m.teamA;
        const winnerTeam = cfg.base + cfg.perSet * setsW;
        const loserTeam = cfg.perSet * setsL;
        winner.forEach((p) => add(p, winnerTeam / 2));
        loser.forEach((p) => add(p, loserTeam / 2));
        [...winner, ...loser].forEach(inc);
    }
    const weeklyScore = {};
    for (const pid of new Set([...Object.keys(raw), ...Object.keys(i.currentRatings)])) {
        const total = raw[pid] || 0;
        const r = rounds[pid] || 0;
        weeklyScore[pid] = r ? Math.round(total / r) : 0;
    }
    const newRatings = {};
    for (const pid of new Set(Object.keys(i.currentRatings).concat(Object.keys(weeklyScore)))) {
        const series = [
            i.weeklyWindow?.[0]?.[pid] || 0,
            i.weeklyWindow?.[1]?.[pid] || 0,
            i.weeklyWindow?.[2]?.[pid] || 0,
            i.weeklyWindow?.[3]?.[pid] || 0,
            weeklyScore[pid] || 0,
        ];
        const valid = series.filter((v) => v > 0);
        newRatings[pid] = valid.length
            ? Math.round(valid.reduce((s, v) => s + v, 0) / valid.length)
            : i.currentRatings[pid] || 0;
    }
    return { weeklyScore, newRatings };
}
// NOTE: Tier is NOT determined by rating. It's assigned dynamically per event
// based on sorted ratings and court availability for event organization only.
// This function is kept for backward compatibility but should not be used.
/** @deprecated Tier is assigned dynamically per event, not based on rating threshold */
const toTier = (rating) => (rating >= 300 ? common_1.Tier.MASTERS : common_1.Tier.EXPLORERS);
exports.toTier = toTier;
