/**
 * Achievement System - Badges for milestones and accomplishments
 * 
 * Achievements unlock once and are stored permanently.
 * They provide long-term goals and recognition for users.
 * 
 * Best Practice: Badges tap into reward psychology, giving users
 * a sense of accomplishment and increasing long-term retention.
 */

const STORAGE_KEY = 'lento.achievements.v1'

/**
 * Achievement Definitions
 */
export const ACHIEVEMENTS = {
    // First steps
    FIRST_QUEST: {
        id: 'first_quest',
        badge: '🌟',
        title: 'Langkah Pertama',
        description: 'Selesaikan quest pertamamu',
        condition: (stats) => stats.totalQuestsCompleted >= 1,
    },

    // Streak achievements
    QUEST_STREAK_7: {
        id: 'quest_streak_7',
        badge: '🔥',
        title: 'On Fire',
        description: 'Complete semua quest 7 hari berturut-turut',
        condition: (stats) => stats.allQuestsCompletedStreak >= 7,
    },
    QUEST_STREAK_30: {
        id: 'quest_streak_30',
        badge: '💪',
        title: 'Unstoppable',
        description: 'Complete semua quest 30 hari berturut-turut',
        condition: (stats) => stats.allQuestsCompletedStreak >= 30,
    },

    // XP milestones
    XP_100: {
        id: 'xp_100',
        badge: '💯',
        title: 'Centurion',
        description: 'Kumpulkan 100 XP total',
        condition: (stats) => stats.totalXP >= 100,
    },
    XP_500: {
        id: 'xp_500',
        badge: '🏆',
        title: 'Champion',
        description: 'Kumpulkan 500 XP total',
        condition: (stats) => stats.totalXP >= 500,
    },
    XP_1000: {
        id: 'xp_1000',
        badge: '👑',
        title: 'Legend',
        description: 'Kumpulkan 1000 XP total',
        condition: (stats) => stats.totalXP >= 1000,
    },

    // Focus achievements
    FOCUS_MASTER: {
        id: 'focus_master',
        badge: '⏱️',
        title: 'Focus Master',
        description: 'Total fokus 10 jam',
        condition: (stats) => stats.totalFocusMinutes >= 600,
    },

    // Books achievements
    BOOKWORM: {
        id: 'bookworm',
        badge: '📚',
        title: 'Bookworm',
        description: 'Selesaikan 5 buku',
        condition: (stats) => stats.booksFinished >= 5,
    },
    BIBLIOPHILE: {
        id: 'bibliophile',
        badge: '📖',
        title: 'Bibliophile',
        description: 'Selesaikan 20 buku',
        condition: (stats) => stats.booksFinished >= 20,
    },

    // Habits achievements
    HABIT_HERO: {
        id: 'habit_hero',
        badge: '🌱',
        title: 'Habit Hero',
        description: 'Streak 30 hari untuk satu kebiasaan',
        condition: (stats) => stats.longestHabitStreak >= 30,
    },

    // Journal achievements
    REFLECTOR: {
        id: 'reflector',
        badge: '📝',
        title: 'Reflector',
        description: 'Tulis 50 jurnal',
        condition: (stats) => stats.totalJournals >= 50,
    },

    // Weekly achievements
    WEEKLY_CHAMPION: {
        id: 'weekly_champion',
        badge: '🎯',
        title: 'Weekly Champion',
        description: 'Complete semua weekly quest 4 minggu berturut-turut',
        condition: (stats) => stats.weeklyQuestsStreak >= 4,
    },
}

/**
 * Load unlocked achievements from storage
 */
function loadUnlocked() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        const data = raw ? JSON.parse(raw) : { unlocked: [], lastCheck: null }
        return data
    } catch {
        return { unlocked: [], lastCheck: null }
    }
}

/**
 * Save unlocked achievements
 */
function saveUnlocked(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
        console.warn('Failed to save achievements:', e)
    }
}

/**
 * Check and unlock new achievements based on current stats
 * Returns newly unlocked achievements (for celebration)
 */
export function checkAndUnlockAchievements(stats) {
    const data = loadUnlocked()
    const newlyUnlocked = []

    for (const achievement of Object.values(ACHIEVEMENTS)) {
        // Skip if already unlocked
        if (data.unlocked.includes(achievement.id)) continue

        // Check condition
        if (achievement.condition(stats)) {
            data.unlocked.push(achievement.id)
            newlyUnlocked.push(achievement)
        }
    }

    if (newlyUnlocked.length > 0) {
        data.lastCheck = new Date().toISOString()
        saveUnlocked(data)
    }

    return newlyUnlocked
}

/**
 * Get all achievements with unlock status
 */
export function getAllAchievements() {
    const data = loadUnlocked()

    return Object.values(ACHIEVEMENTS).map(ach => ({
        ...ach,
        unlocked: data.unlocked.includes(ach.id),
    }))
}

/**
 * Get unlocked achievements only
 */
export function getUnlockedAchievements() {
    const data = loadUnlocked()

    return Object.values(ACHIEVEMENTS)
        .filter(ach => data.unlocked.includes(ach.id))
        .map(ach => ({ ...ach, unlocked: true }))
}

/**
 * Get achievement count
 */
export function getAchievementStats() {
    const data = loadUnlocked()
    return {
        unlocked: data.unlocked.length,
        total: Object.keys(ACHIEVEMENTS).length,
    }
}

/**
 * Reset achievements (for testing)
 */
export function resetAchievements() {
    saveUnlocked({ unlocked: [], lastCheck: null })
}
