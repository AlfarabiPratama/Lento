/**
 * Weekly Quests - Bonus challenges with bigger XP rewards
 * 
 * Weekly quests reset every Monday (UTC) and provide
 * a medium-term goal to increase user retention.
 * 
 * Best Practice: Weekly challenges create meaningful progress
 * beyond daily habits, giving users reason to return each week.
 */

const STORAGE_KEY = 'lento.quests.weekly.v1'

/**
 * Get the Monday of the current week (for reset logic)
 */
export function getWeekStartKey(date = new Date()) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d.toISOString().split('T')[0]
}

/**
 * Weekly Quest Definitions
 * Higher XP (50) for bigger challenges
 */
export const WEEKLY_QUESTS = {
    WEEKLY_STREAK: {
        id: 'weekly_streak',
        badge: '⭐',
        xp: 50,
        getTitle: () => 'Selesaikan 5 quest harian minggu ini',
        getProgress: (stats) => ({
            current: Math.min(stats.dailyQuestsCompletedThisWeek || 0, 5),
            target: 5
        }),
    },
    WEEKLY_FOCUS: {
        id: 'weekly_focus',
        badge: '⏱️',
        xp: 50,
        getTitle: () => 'Fokus total 2 jam minggu ini',
        getProgress: (stats) => ({
            current: Math.min(stats.focusMinutesThisWeek || 0, 120),
            target: 120
        }),
    },
    WEEKLY_HABIT: {
        id: 'weekly_habit',
        badge: '🔥',
        xp: 50,
        getTitle: () => 'Check-in kebiasaan setiap hari minggu ini',
        getProgress: (stats) => ({
            current: Math.min(stats.habitDaysThisWeek || 0, 7),
            target: 7
        }),
    },
}

/**
 * Load weekly quest state from storage
 */
function loadWeeklyState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : { weekKey: null, assigned: [], completed: [] }
    } catch {
        return { weekKey: null, assigned: [], completed: [] }
    }
}

/**
 * Save weekly quest state
 */
function saveWeeklyState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
        console.warn('Failed to save weekly quest state:', e)
    }
}

/**
 * Get weekly quests for current week
 * Assigns 2 quests per week (random selection)
 */
export function getWeeklyQuests(stats) {
    const weekKey = getWeekStartKey()
    let state = loadWeeklyState()

    // Reset if new week
    if (state.weekKey !== weekKey) {
        // Pick 2 random quests for this week
        const allIds = Object.keys(WEEKLY_QUESTS)
        const shuffled = [...allIds].sort(() => Math.random() - 0.5)
        const assigned = shuffled.slice(0, 2)

        state = {
            weekKey,
            assigned,
            completed: []
        }
        saveWeeklyState(state)
    }

    // Materialize quests with current progress
    return state.assigned.map(key => {
        const def = WEEKLY_QUESTS[key]
        if (!def) return null

        const { current, target } = def.getProgress(stats)
        const completed = current >= target

        // Auto-complete if not already marked
        if (completed && !state.completed.includes(def.id)) {
            state.completed.push(def.id)
            saveWeeklyState(state)
        }

        return {
            id: def.id,
            badge: def.badge,
            title: def.getTitle(),
            xp: def.xp,
            progress: { current, target },
            completed,
            isWeekly: true,
        }
    }).filter(Boolean)
}

/**
 * Get weekly XP earned
 */
export function getWeeklyXP() {
    const state = loadWeeklyState()
    const weekKey = getWeekStartKey()

    if (state.weekKey !== weekKey) return 0

    return state.completed.reduce((sum, id) => {
        const quest = Object.values(WEEKLY_QUESTS).find(q => q.id === id)
        return sum + (quest?.xp || 0)
    }, 0)
}

/**
 * Check if all weekly quests completed
 */
export function allWeeklyCompleted() {
    const state = loadWeeklyState()
    const weekKey = getWeekStartKey()

    if (state.weekKey !== weekKey) return false
    return state.assigned.length > 0 &&
        state.completed.length >= state.assigned.length
}
