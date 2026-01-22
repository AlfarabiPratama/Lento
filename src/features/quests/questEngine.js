/**
 * Quest Engine - Deterministic daily quest selection
 * 
 * Uses a seed based on date + install ID for stable randomization.
 * Quests don't change mid-day, but vary between users and days.
 */

import { QUESTS, QUEST_BY_ID } from './questTypes'
import { getInstallId, getOrCreateDailyAssignment } from './questStorage'

const DEFAULT_MAX = 4

/**
 * Simple deterministic hash function
 */
function hashStringToInt(str) {
    let h = 2166136261
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i)
        h = Math.imul(h, 16777619)
    }
    return h >>> 0
}

/**
 * Mulberry32 PRNG - deterministic pseudo-random generator
 * Given same seed, always produces same sequence
 */
function mulberry32(seed) {
    return function () {
        let t = seed += 0x6D2B79F5
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

/**
 * Pick random element from array using RNG
 */
function pickOne(rng, arr) {
    return arr[Math.floor(rng() * arr.length)]
}

/**
 * Build params for a specific quest type
 */
function buildParamsForQuest(id, stats, rng) {
    switch (id) {
        case 'habit_complete':
            // Target is min(3, activeHabits) so it's achievable
            return { target: Math.max(1, Math.min(3, stats.activeHabitsCount)) }

        case 'focus_minutes': {
            // Random target: 15, 25, or 45 minutes
            const options = [15, 25, 45]
            return { target: pickOne(rng, options) }
        }

        default:
            return {}
    }
}

/**
 * Get daily quests with stable assignment
 * 
 * @param {Object} options
 * @param {string} options.todayKey - YYYY-MM-DD
 * @param {Object} options.stats - Quest stats from buildQuestStats
 * @param {number} options.max - Max quests per day (default: 4)
 * @returns {Array} Array of materialized quest objects
 */
export function getDailyQuests({ todayKey, stats, max = DEFAULT_MAX }) {
    const installId = getInstallId()

    // Get or create stable assignment for today
    const assignment = getOrCreateDailyAssignment(todayKey, () => {
        // Create seed from date + install ID
        const seed = hashStringToInt(`${todayKey}:${installId}`)
        const rng = mulberry32(seed)

        // Get eligible quests
        const candidates = Object.values(QUESTS)
            .filter(q => q.isEligible(stats))

        const chosen = []

        // Journal quest is always first if eligible (it's the "anchor")
        const journalQuest = QUESTS.JOURNAL_WRITE
        if (journalQuest.isEligible(stats)) {
            chosen.push({ id: journalQuest.id, params: {} })
        }

        // Pick remaining quests from pool (no duplicates)
        const pool = candidates
            .filter(q => q.id !== 'journal_write')
            .map(q => q.id)

        while (chosen.length < max && pool.length > 0) {
            const id = pickOne(rng, pool)
            pool.splice(pool.indexOf(id), 1)

            const params = buildParamsForQuest(id, stats, rng)
            chosen.push({ id, params })
        }

        return { seed, chosen, rerolled: false }
    })

    // Materialize quests with current progress
    return assignment.chosen.map(({ id, params }) => {
        const def = QUEST_BY_ID[id]
        if (!def) return null

        const { current, target } = def.getProgress(stats, params)
        const completed = current >= target

        return {
            id,
            category: def.category,
            title: def.getTitle(params),
            xp: def.xp,
            params,
            progress: { current, target },
            completed,
        }
    }).filter(Boolean)
}

/**
 * Get eligible quests not already assigned (for reroll)
 */
export function getRerollCandidates(assignedQuestIds, stats) {
    return Object.values(QUESTS)
        .filter(q => q.isEligible(stats))
        .map(q => q.id)
        .filter(id => !assignedQuestIds.includes(id))
}

/**
 * Deterministic pick for reroll replacement
 * Uses seed + "reroll" suffix for consistent selection
 */
export function pickRerollReplacement({ todayKey, installId, assignmentSeed, assignedQuestIds, stats }) {
    const candidates = getRerollCandidates(assignedQuestIds, stats)
    if (candidates.length === 0) return null

    const seed = hashStringToInt(`${todayKey}:${installId}:${assignmentSeed}:reroll`)
    const rng = mulberry32(seed)

    return candidates[Math.floor(rng() * candidates.length)]
}

/**
 * Build params for a specific quest type (exported for reroll)
 */
export { buildParamsForQuest }
