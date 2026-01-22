/**
 * Quest Storage - Persist daily quest assignments
 * 
 * Stores which quests are assigned each day so they don't change mid-day.
 * Assignments are minimal: just quest IDs and params, not progress.
 */

const STORAGE_KEY = 'lento.quests.daily.v1'
const INSTALL_ID_KEY = 'lento.installId.v1'
const MAX_DAYS_KEEP = 14

/**
 * Safe JSON parse with fallback
 */
function safeJsonParse(str, fallback) {
    if (!str) return fallback
    try {
        const parsed = JSON.parse(str)
        // Ensure we return the fallback if parsed is null/undefined
        return parsed ?? fallback
    } catch {
        return fallback
    }
}

/**
 * Get or create a unique install ID for this device
 * Used as part of the seed for quest randomization
 */
export function getInstallId() {
    try {
        const existing = localStorage.getItem(INSTALL_ID_KEY)
        if (existing) return existing

        const id = crypto?.randomUUID?.() ?? `iid_${Math.random().toString(16).slice(2)}`
        localStorage.setItem(INSTALL_ID_KEY, id)
        return id
    } catch {
        // localStorage disabled; use memory-only ID
        return `iid_mem_${Math.random().toString(16).slice(2)}`
    }
}

/**
 * Load all quest assignments from storage
 */
export function loadQuestAssignments() {
    const DEFAULT_STATE = { byDate: {} }
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        const parsed = safeJsonParse(raw, DEFAULT_STATE)
        // Ensure byDate exists even if stored object lacks it
        if (!parsed.byDate) parsed.byDate = {}
        return parsed
    } catch {
        return DEFAULT_STATE
    }
}

/**
 * Save quest assignments to storage
 */
export function saveQuestAssignments(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
        // QuotaExceededError possible
        console.warn('Quest assignment save failed:', e)
    }
}

/**
 * Get or create quest assignment for a specific date
 * 
 * If assignment exists for date, return it.
 * Otherwise, call createFn to generate new assignment and persist it.
 * Also prunes old dates to keep storage clean.
 * 
 * @param {string} dateKey - YYYY-MM-DD
 * @param {Function} createFn - Function that creates new assignment
 * @returns {Object} Assignment for the date
 */
export function getOrCreateDailyAssignment(dateKey, createFn) {
    const state = loadQuestAssignments()

    // Return existing if available
    if (state.byDate?.[dateKey]) {
        return state.byDate[dateKey]
    }

    // Create new assignment
    const assignment = createFn()

    // Prune old dates
    const nextByDate = { ...(state.byDate || {}), [dateKey]: assignment }
    const dates = Object.keys(nextByDate).sort()
    while (dates.length > MAX_DAYS_KEEP) {
        const oldest = dates.shift()
        delete nextByDate[oldest]
    }


    saveQuestAssignments({ byDate: nextByDate })
    return assignment
}

/**
 * Check if reroll is available for today
 */
export function canReroll(dateKey) {
    const state = loadQuestAssignments()
    return !state.byDate?.[dateKey]?.rerolled
}

/**
 * Replace exactly 1 quest in today's assignment
 * 
 * Guards:
 * - Only once per day
 * - Cannot replace mandatory quest ids
 * - Prevents duplicate quest assignments
 * 
 * @param {string} dateKey - YYYY-MM-DD
 * @param {string} questIdToReplace - Quest ID to swap out
 * @param {string} newQuestId - Quest ID to swap in
 * @param {Object} newParams - Params for new quest
 * @returns {boolean} Success
 */
export function executeReroll(dateKey, questIdToReplace, newQuestId, newParams = {}) {
    const state = loadQuestAssignments()
    const assignment = state.byDate?.[dateKey]

    // Guard: no assignment or already rerolled
    if (!assignment || assignment.rerolled) return false

    // Guard: quest to replace must exist
    const idx = assignment.chosen.findIndex(q => q.id === questIdToReplace)
    if (idx === -1) return false

    // Guard: prevent duplicate quests
    const alreadyAssigned = assignment.chosen.some(q => q.id === newQuestId)
    if (alreadyAssigned) return false

    // Execute swap
    assignment.chosen[idx] = { id: newQuestId, params: newParams }
    assignment.rerolled = true

    try {
        saveQuestAssignments(state)
    } catch (e) {
        console.warn('Failed to persist reroll assignment:', e)
        return false
    }

    return true
}

/**
 * Get today's assignment (for accessing seed, etc.)
 */
export function getDailyAssignment(dateKey) {
    const state = loadQuestAssignments()
    return state.byDate?.[dateKey] || null
}
