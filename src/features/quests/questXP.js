/**
 * Quest XP Ledger - Track daily XP earnings
 * 
 * Idempotent recording: XP only ever increases for a given date.
 * Prunes old dates to keep localStorage clean.
 */

const XP_KEY = 'lento.quests.xp.v1'
const KEEP_DAYS = 30

function safeParse(str, fallback) {
    if (!str) return fallback
    try {
        return JSON.parse(str) ?? fallback
    } catch {
        return fallback
    }
}

function loadXP() {
    try {
        return safeParse(localStorage.getItem(XP_KEY), { byDate: {} })
    } catch {
        return { byDate: {} }
    }
}

function saveXP(state) {
    try {
        localStorage.setItem(XP_KEY, JSON.stringify(state))
    } catch (e) {
        // localStorage can be unusable or quota exceeded
        console.warn('XP ledger not saved (storage issue):', e)
    }
}

function pruneByDate(byDate) {
    const keys = Object.keys(byDate).sort()
    while (keys.length > KEEP_DAYS) {
        const oldest = keys.shift()
        delete byDate[oldest]
    }
    return byDate
}

/**
 * Idempotent record: earned only ever increases (max)
 */
export function recordDailyXP(dateKey, earnedXP, questCount) {
    const state = loadXP()
    const prev = state.byDate[dateKey] || { earned: 0, quests: 0 }

    const nextEarned = Math.max(prev.earned || 0, earnedXP || 0)
    const nextQuests = Math.max(prev.quests || 0, questCount || 0)

    state.byDate[dateKey] = { earned: nextEarned, quests: nextQuests }
    state.byDate = pruneByDate(state.byDate)

    saveXP(state)
    return state.byDate[dateKey]
}

/**
 * Get XP for a specific date
 */
export function getTodayXP(dateKey) {
    const state = loadXP()
    return state.byDate[dateKey] || { earned: 0, quests: 0 }
}

/**
 * Get XP history for last N days
 */
export function getXPHistory(dateKeys = []) {
    const state = loadXP()
    return dateKeys.map(k => ({
        dateKey: k,
        ...(state.byDate[k] || { earned: 0, quests: 0 })
    }))
}

/**
 * Compute all-time XP from history
 */
export function getAllTimeXP() {
    const state = loadXP()
    return Object.values(state.byDate).reduce((sum, d) => sum + (d.earned || 0), 0)
}
