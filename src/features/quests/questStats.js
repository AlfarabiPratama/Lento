/**
 * Quest Stats - Aggregate user data into stats for quest computation
 * 
 * Pure functions that convert raw data arrays into simple stats object.
 * Makes quest engine testable and decoupled from data structure.
 */

import { getAllTimeXP } from './questXP'

/**
 * Get local date key (YYYY-MM-DD) - avoids UTC timezone shift issues
 * toISOString() returns UTC which can be off by a day in Asian timezones
 */
export function getLocalDateKey(date = new Date()) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

/**
 * Get the Monday of the current week
 */
export function getWeekStartKey(date = new Date()) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d.toISOString().split('T')[0]
}

/**
 * Check if a date string or Date matches today's key
 */
function isSameDay(dateOrKey, todayKey) {
    if (!dateOrKey) return false
    if (typeof dateOrKey === 'string') {
        return dateOrKey.startsWith(todayKey)
    }
    if (dateOrKey instanceof Date) {
        return getLocalDateKey(dateOrKey) === todayKey
    }
    return false
}

/**
 * Check if date is within current week
 */
function isThisWeek(dateOrKey, weekStartKey) {
    if (!dateOrKey) return false
    const dateStr = typeof dateOrKey === 'string'
        ? dateOrKey.split('T')[0]
        : getLocalDateKey(dateOrKey)

    // Week ends on Sunday (7 days from Monday)
    const weekStart = new Date(weekStartKey + 'T00:00:00')
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const date = new Date(dateStr + 'T00:00:00')
    return date >= weekStart && date < weekEnd
}

/**
 * Count habits completed on a specific date
 */
function countHabitsCompletedOn(habits, todayKey) {
    return habits.reduce((sum, h) => {
        const completed = h?.completions?.[todayKey] === true
        return sum + (completed ? 1 : 0)
    }, 0)
}

/**
 * Count unique days with habit check-ins this week
 */
function countHabitDaysThisWeek(habits, weekStartKey) {
    const days = new Set()

    habits.forEach(h => {
        if (!h?.completions) return
        Object.keys(h.completions).forEach(dateKey => {
            if (h.completions[dateKey] && isThisWeek(dateKey, weekStartKey)) {
                days.add(dateKey)
            }
        })
    })

    return days.size
}

/**
 * Build quest stats from raw user data
 */
export function buildQuestStats({
    habits = [],
    journals = [],
    focusSessions = [],
    books = []
}, now = new Date()) {
    const todayKey = getLocalDateKey(now)
    const weekStartKey = getWeekStartKey(now)

    // Habits
    const activeHabits = habits.filter(h => h?.active !== false)
    const habitsCompletedToday = countHabitsCompletedOn(activeHabits, todayKey)

    // Journal
    const hasJournalToday = journals.some(e => isSameDay(e?.date, todayKey))

    // Focus - today and this week
    const focusMinutesToday = focusSessions
        .filter(s => isSameDay(s?.startTime, todayKey))
        .reduce((sum, s) => sum + (s?.duration || 0), 0)

    const focusMinutesThisWeek = focusSessions
        .filter(s => isThisWeek(s?.startTime, weekStartKey))
        .reduce((sum, s) => sum + (s?.duration || 0), 0)

    // Books
    const hasAnyBook = books.length > 0
    const booksFinished = books.filter(b => b?.status === 'finished').length

    // Usage signals
    const usedFocusBefore = focusSessions.length > 0
    const usedJournalBefore = journals.length > 0
    const usedBooksBefore = books.length > 0

    // Weekly stats for weekly quests
    const habitDaysThisWeek = countHabitDaysThisWeek(activeHabits, weekStartKey)

    // Total stats for achievements
    const totalXP = getAllTimeXP()
    const totalJournals = journals.length
    const totalFocusMinutes = focusSessions
        .reduce((sum, s) => sum + (s?.duration || 0), 0)

    // Longest habit streak (simplified - find max streak_current)
    const longestHabitStreak = Math.max(
        ...activeHabits.map(h => h?.streak_current || 0),
        0
    )

    return {
        todayKey,
        weekStartKey,
        activeHabitsCount: activeHabits.length,
        habitsCompletedToday,
        hasJournalToday,
        focusMinutesToday,
        focusMinutesThisWeek,
        hasAnyBook,
        usedFocusBefore,
        usedJournalBefore,
        usedBooksBefore,
        // Weekly
        habitDaysThisWeek,
        dailyQuestsCompletedThisWeek: 0, // Will be computed from XP ledger
        // Totals for achievements
        totalXP,
        totalJournals,
        totalFocusMinutes,
        booksFinished,
        longestHabitStreak,
        totalQuestsCompleted: 0, // Will be computed
        allQuestsCompletedStreak: 0, // Will be computed
        weeklyQuestsStreak: 0, // Will be computed
    }
}

