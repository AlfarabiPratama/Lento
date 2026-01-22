/**
 * Quest Types - Single source of truth for all quest definitions
 * 
 * Each quest has:
 * - id: unique identifier
 * - category: grouping (habits, journal, focus, books)
 * - xp: reward points
 * - isEligible(stats): should this quest be offered?
 * - getTitle(params): human-readable title
 * - getProgress(stats, params): { current, target } for progress tracking
 */

export const QUESTS = {
    // ------- JOURNAL -------
    JOURNAL_WRITE: {
        id: 'journal_write',
        category: 'journal',
        xp: 15,
        isEligible: () => true, // Always available
        getTitle: () => 'Tulis jurnal hari ini',
        getProgress: (stats) => ({
            current: stats.hasJournalToday ? 1 : 0,
            target: 1
        }),
    },

    // ------- HABITS -------
    HABIT_COMPLETE: {
        id: 'habit_complete',
        category: 'habits',
        xp: 10,
        isEligible: (stats) => stats.activeHabitsCount > 0,
        getTitle: (p) => `Selesaikan ${p.target} kebiasaan hari ini`,
        getProgress: (stats, p) => ({
            current: Math.min(stats.habitsCompletedToday, p.target),
            target: p.target
        }),
    },

    // ------- FOCUS -------
    FOCUS_MINUTES: {
        id: 'focus_minutes',
        category: 'focus',
        xp: 15,
        // Only show if user has used focus feature before
        isEligible: (stats) => stats.usedFocusBefore,
        getTitle: (p) => `Fokus ${p.target} menit hari ini`,
        getProgress: (stats, p) => ({
            current: Math.min(stats.focusMinutesToday, p.target),
            target: p.target
        }),
    },

    // ------- BOOKS -------
    BOOK_READ: {
        id: 'book_read',
        category: 'books',
        xp: 10,
        // Only show if user has added at least one book
        isEligible: (stats) => stats.hasAnyBook,
        getTitle: () => 'Baca buku hari ini',
        getProgress: (stats) => ({
            current: stats.hasAnyBook ? 1 : 0, // Simplified for MVP
            target: 1
        }),
    },
}

export const ALL_QUEST_IDS = Object.values(QUESTS).map(q => q.id)
export const QUEST_BY_ID = Object.values(QUESTS).reduce((acc, q) => {
    acc[q.id] = q
    return acc
}, {})
