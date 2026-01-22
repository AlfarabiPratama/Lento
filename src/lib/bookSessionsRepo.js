import { getDB, generateId, now } from './db'

/**
 * Book Sessions Repository - Reading log operations
 */

function getDayKey(dateString) {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0] // "YYYY-MM-DD"
}

export async function getAllSessions() {
    const db = await getDB()
    const sessions = await db.getAll('book_sessions')
    return sessions.filter(s => !s.deleted)
}

export async function getSessionsByBook(bookId) {
    const db = await getDB()
    const sessions = await db.getAllFromIndex('book_sessions', 'by_book', bookId)
    return sessions.filter(s => !s.deleted).sort((a, b) =>
        new Date(b.occurredAt) - new Date(a.occurredAt)
    )
}

export async function getSessionsByDay(dayKey) {
    const db = await getDB()
    const sessions = await db.getAllFromIndex('book_sessions', 'by_day', dayKey)
    return sessions.filter(s => !s.deleted)
}

export async function getSessionsInRange(startDate, endDate) {
    const sessions = await getAllSessions()
    return sessions.filter(s => {
        const date = new Date(s.occurredAt)
        return date >= new Date(startDate) && date <= new Date(endDate)
    })
}

export async function createSession(sessionData) {
    const db = await getDB()

    const session = {
        id: generateId(),
        bookId: sessionData.bookId,
        occurredAt: sessionData.occurredAt || now(),
        dayKey: getDayKey(sessionData.occurredAt || now()),
        delta: sessionData.delta,
        unit: sessionData.unit,
        durationMinutes: sessionData.durationMinutes || null,
        note: sessionData.note || null,
        source: sessionData.source || 'manual',
        deleted: false,
        deletedAt: null,
        createdAt: now(),
        updatedAt: now(),
        user_id: 'local',
        sync_status: 'pending'
    }

    // Validate delta > 0
    if (session.delta <= 0) {
        throw new Error('Delta must be greater than 0')
    }

    await db.put('book_sessions', session)
    return session
}

export async function updateSession(id, updates) {
    const db = await getDB()
    const session = await db.get('book_sessions', id)

    if (!session) {
        throw new Error('Session not found')
    }

    const updated = {
        ...session,
        ...updates,
        updatedAt: now(),
        sync_status: 'pending',
        // Recalculate dayKey if occurredAt changed
        dayKey: updates.occurredAt ? getDayKey(updates.occurredAt) : session.dayKey
    }

    await db.put('book_sessions', updated)
    return updated
}

export async function deleteSession(id) {
    const db = await getDB()
    const session = await db.get('book_sessions', id)

    if (!session) {
        throw new Error('Session not found')
    }

    // Soft delete
    const updated = {
        ...session,
        deleted: true,
        deletedAt: now(),
        updatedAt: now(),
        sync_status: 'pending'
    }

    await db.put('book_sessions', updated)
    return updated
}

/**
 * Get unique days with sessions (for streak calculation)
 */
export async function getUniqueDaysWithSessions() {
    const sessions = await getAllSessions()
    const uniqueDays = new Set(sessions.map(s => s.dayKey))
    return Array.from(uniqueDays).sort()
}

/**
 * Get weekly stats (pages & minutes)
 */
export async function getWeeklyStats() {
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(today.getDate() - 7)

    const sessions = await getSessionsInRange(weekAgo, today)

    return sessions.reduce((stats, session) => {
        if (session.unit === 'pages') {
            stats.pages += session.delta
        } else if (session.unit === 'minutes') {
            stats.minutes += session.delta
        }
        stats.sessionCount++
        return stats
    }, { pages: 0, minutes: 0, sessionCount: 0 })
}

/**
 * Get daily stats for last N days (for chart)
 * @param {number} days - Number of days to fetch (default 7)
 * @returns {Promise<Array<{date: string, dayLabel: string, pages: number, minutes: number}>>}
 */
export async function getDailyStats(days = 7) {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - (days - 1))
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(today)
    endDate.setHours(23, 59, 59, 999)

    const sessions = await getSessionsInRange(startDate, endDate)

    // Create array of days
    const dailyStats = []
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

    for (let i = 0; i < days; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        const dateKey = date.toISOString().split('T')[0]

        dailyStats.push({
            date: dateKey,
            dayLabel: dayNames[date.getDay()],
            dayNumber: date.getDate(),
            pages: 0,
            minutes: 0
        })
    }

    // Aggregate sessions into daily buckets
    for (const session of sessions) {
        const sessionDate = session.dayKey
        const dayStats = dailyStats.find(d => d.date === sessionDate)

        if (dayStats) {
            if (session.unit === 'pages') {
                dayStats.pages += session.delta
            } else if (session.unit === 'minutes') {
                dayStats.minutes += session.delta
            }
        }
    }

    return dailyStats
}

/**
 * Get reading streak (consecutive days with sessions)
 */
export async function getReadingStreak() {
    const uniqueDays = await getUniqueDaysWithSessions()

    if (uniqueDays.length === 0) return 0

    // Check if today has a session
    const todayKey = getDayKey(now())
    let streak = 0
    let currentDate = new Date()

    // Start from today and count backwards
    while (true) {
        const dateKey = getDayKey(currentDate.toISOString())

        if (uniqueDays.includes(dateKey)) {
            streak++
            currentDate.setDate(currentDate.getDate() - 1)
        } else {
            break
        }
    }

    return streak
}
