import { getDB, createBaseFields, markUpdated, markDeleted } from './db'
import { addToOutbox } from './outbox'
import { generateReminderJobs, cancelReminderJobs, refreshReminderJobs } from './reminderJobs'

const STORE = 'habits'

/**
 * Habits Service - CRUD operations untuk kebiasaan
 */

/**
 * Get all active habits (not deleted)
 * @param {Object} options - Filter options
 * @param {boolean} options.includeArchived - Include archived habits
 */
export async function getAllHabits(options = {}) {
    const { includeArchived = false } = options
    const db = await getDB()
    const all = await db.getAll(STORE)
    return all
        .filter(h => !h.deleted_at && (includeArchived || !h.archived_at))
        .sort((a, b) => {
            // Sort by order field first (if exists), then by creation date
            if (a.order !== undefined && b.order !== undefined) {
                return a.order - b.order
            }
            return new Date(b.created_at) - new Date(a.created_at)
        })
}

/**
 * Get habit by ID
 */
export async function getHabit(id) {
    const db = await getDB()
    return db.get(STORE, id)
}

/**
 * Create new habit
 */
export async function createHabit({
    name,
    description = '',
    color = 'primary',
    category = '', // NEW: Kesehatan, Produktivitas, Belajar, etc
    tags = [], // NEW: Custom tags
    icon = '', // NEW: Icon name from Tabler Icons
    frequency = 'daily',
    reminder_enabled = false,
    reminder_time = null,
    reminder_days = null  // null = ikut target_days, [] atau [1,2,3] = hari spesifik
}) {
    const db = await getDB()

    const habit = {
        ...createBaseFields(),
        name,
        description,
        color,
        category,
        tags,
        icon,
        frequency, // 'daily' | 'weekly' | 'custom'
        target_days: frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : [], // 0=Sunday
        streak_current: 0,
        streak_best: 0,
        reminder_enabled,
        reminder_time,
        reminder_days, // null = fallback ke target_days
    }

    await db.add(STORE, habit)
    await addToOutbox(STORE, 'create', habit)

    // Generate reminder jobs for server push (Phase 3)
    if (habit.reminder_enabled && habit.reminder_time) {
        generateReminderJobs(habit).catch(console.error)
    }

    return habit
}

/**
 * Update habit
 */
export async function updateHabit(id, updates) {
    const db = await getDB()
    const habit = await db.get(STORE, id)

    if (!habit) throw new Error('Habit not found')

    const updated = markUpdated({
        ...habit,
        ...updates,
    })

    await db.put(STORE, updated)
    await addToOutbox(STORE, 'update', updated)

    // Refresh reminder jobs if reminder settings changed (Phase 3)
    if ('reminder_enabled' in updates || 'reminder_time' in updates || 'reminder_days' in updates) {
        refreshReminderJobs(updated).catch(console.error)
    }

    return updated
}

/**
 * Archive habit (soft archive - different from delete)
 */
export async function archiveHabit(id) {
    const db = await getDB()
    const habit = await db.get(STORE, id)

    if (!habit) throw new Error('Habit not found')

    const archived = markUpdated({
        ...habit,
        archived_at: new Date().toISOString(),
    })

    await db.put(STORE, archived)
    await addToOutbox(STORE, 'update', archived)

    // Cancel reminder jobs when archived
    cancelReminderJobs(id).catch(console.error)

    return archived
}

/**
 * Unarchive habit
 */
export async function unarchiveHabit(id) {
    const db = await getDB()
    const habit = await db.get(STORE, id)

    if (!habit) throw new Error('Habit not found')

    const unarchived = markUpdated({
        ...habit,
        archived_at: null,
    })

    await db.put(STORE, unarchived)
    await addToOutbox(STORE, 'update', unarchived)

    // Restore reminder jobs if enabled
    if (unarchived.reminder_enabled && unarchived.reminder_time) {
        generateReminderJobs(unarchived).catch(console.error)
    }

    return unarchived
}

/**
 * Delete habit (soft delete)
 */
export async function deleteHabit(id) {
    const db = await getDB()
    const habit = await db.get(STORE, id)

    if (!habit) throw new Error('Habit not found')

    const deleted = markDeleted(habit)

    await db.put(STORE, deleted)
    await addToOutbox(STORE, 'delete', deleted)

    // Cancel all pending reminder jobs (Phase 3)
    cancelReminderJobs(id).catch(console.error)

    return deleted
}

// ============ Check-ins ============

const CHECKIN_STORE = 'checkins'

/**
 * Check in habit for a date
 */
export async function checkInHabit(habitId, date = new Date(), note = '') {
    const db = await getDB()
    const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD

    // Check if already checked in
    const existing = await getCheckinForDate(habitId, dateStr)
    if (existing) {
        return existing
    }

    const checkin = {
        ...createBaseFields(),
        habit_id: habitId,
        date: dateStr,
        completed: true,
        note: note || '',
    }

    await db.add(CHECKIN_STORE, checkin)
    await addToOutbox(CHECKIN_STORE, 'create', checkin)

    // Update streak
    await updateStreak(habitId)

    return checkin
}

/**
 * Remove check-in for a date
 */
export async function uncheckHabit(habitId, date = new Date()) {
    const db = await getDB()
    const dateStr = date.toISOString().split('T')[0]

    const checkin = await getCheckinForDate(habitId, dateStr)
    if (!checkin) return null

    const deleted = markDeleted(checkin)
    await db.put(CHECKIN_STORE, deleted)
    await addToOutbox(CHECKIN_STORE, 'delete', deleted)

    // Update streak
    await updateStreak(habitId)

    return deleted
}

/**
 * Get check-in for specific habit and date
 */
export async function getCheckinForDate(habitId, dateStr) {
    const db = await getDB()
    const all = await db.getAllFromIndex(CHECKIN_STORE, 'by_habit', habitId)
    return all.find(c => c.date === dateStr && !c.deleted_at)
}

/**
 * Get all check-ins for a habit in date range
 */
export async function getCheckinsInRange(habitId, startDate, endDate) {
    const db = await getDB()
    const all = await db.getAllFromIndex(CHECKIN_STORE, 'by_habit', habitId)

    const start = startDate.toISOString().split('T')[0]
    const end = endDate.toISOString().split('T')[0]

    return all.filter(c =>
        !c.deleted_at &&
        c.date >= start &&
        c.date <= end
    ).sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Get check-ins for today
 */
export async function getTodayCheckins() {
    const db = await getDB()
    const today = new Date().toISOString().split('T')[0]
    const all = await db.getAllFromIndex(CHECKIN_STORE, 'by_date', today)
    return all.filter(c => !c.deleted_at)
}

/**
 * Update streak for a habit
 */
async function updateStreak(habitId) {
    const db = await getDB()
    const habit = await db.get(STORE, habitId)
    if (!habit) return

    // Get last 30 days of checkins
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const checkins = await getCheckinsInRange(habitId, startDate, endDate)
    const checkinDates = new Set(checkins.map(c => c.date))

    // Calculate current streak
    let streak = 0
    const today = new Date()

    for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(checkDate.getDate() - i)
        const dateStr = checkDate.toISOString().split('T')[0]

        if (checkinDates.has(dateStr)) {
            streak++
        } else if (i > 0) { // Allow today to be unchecked
            break
        }
    }

    const updated = {
        ...habit,
        streak_current: streak,
        streak_best: Math.max(habit.streak_best, streak),
        updated_at: new Date().toISOString(),
        sync_status: 'dirty',
    }

    await db.put(STORE, updated)
}

/**
 * Get habit stats
 */
export async function getHabitStats(habitId) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)

    const checkins = await getCheckinsInRange(habitId, startDate, endDate)

    return {
        week_count: checkins.length,
        week_rate: Math.round((checkins.length / 7) * 100),
    }
}

export default {
    getAllHabits,
    getHabit,
    createHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    unarchiveHabit,
    checkInHabit,
    uncheckHabit,
    getCheckinForDate,
    getCheckinsInRange,
    getTodayCheckins,
    getHabitStats,
}
