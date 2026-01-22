/**
 * useCalendarData - Aggregate activities by date for calendar visualization
 * 
 * Collects data from habits, journals, focus sessions, and books
 * Returns activities grouped by date for calendar display
 */

import { useState, useEffect, useMemo } from 'react'
import { useHabits, useTodayCheckins } from './useHabits'
import { useJournals } from './useJournals'

/**
 * Get date key in YYYY-MM-DD format
 */
function getDateKey(date) {
    const d = new Date(date)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

/**
 * Get all days in a month
 */
export function getDaysInMonth(year, month) {
    const days = []
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Days from previous month to fill first week
    const startDayOfWeek = firstDay.getDay()
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const d = new Date(year, month, -i)
        days.push({ date: d, isCurrentMonth: false })
    }

    // Days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const d = new Date(year, month, i)
        days.push({ date: d, isCurrentMonth: true })
    }

    // Days from next month to fill last week
    const remainingDays = 42 - days.length // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
        const d = new Date(year, month + 1, i)
        days.push({ date: d, isCurrentMonth: false })
    }

    return days
}

/**
 * Get week start key (Monday)
 */
function getWeekStartKey(date = new Date()) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    return getDateKey(d)
}

/**
 * Main hook to get calendar data
 */
export function useCalendarData(year, month) {
    const { habits } = useHabits()
    const { journals } = useJournals() // Fixed: was 'entries' which doesn't exist
    const [checkins, setCheckins] = useState([]) // Habit checkins from separate store
    const [focusSessions, setFocusSessions] = useState([])
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)

    // Load checkins, focus and books data
    useEffect(() => {
        async function loadData() {
            const { getDB } = await import('../lib/db')
            const db = await getDB()

            // Load habit checkins from separate checkins store
            try {
                const allCheckins = await db.getAll('checkins')
                // Filter: only non-deleted checkins
                const validCheckins = (allCheckins || []).filter(c => !c.deleted_at)
                setCheckins(validCheckins)
            } catch (e) {
                console.warn('Checkins data not available:', e)
                setCheckins([])
            }

            // Focus sessions - load from IndexedDB pomodoro_sessions store
            try {
                const allSessions = await db.getAll('pomodoro_sessions')
                // Filter: only completed sessions that aren't deleted
                const completedSessions = (allSessions || []).filter(s =>
                    s.completed && !s.deleted_at
                )
                setFocusSessions(completedSessions)
            } catch (e) {
                console.warn('Focus data not available:', e)
                setFocusSessions([])
            }

            try {
                // Load book sessions (reading logs) - stored in book_sessions store
                const { getAllSessions } = await import('../lib/bookSessionsRepo')
                const { getAllBooks } = await import('../lib/booksRepo')

                const [allSessions, allBooks] = await Promise.all([
                    getAllSessions(),
                    getAllBooks()
                ])

                // Create a map of book id -> book for quick lookup
                const bookMap = {}
                    ; (allBooks || []).forEach(book => {
                        bookMap[book.id] = book
                    })

                // Enrich sessions with book info
                const enrichedSessions = (allSessions || []).map(session => ({
                    ...session,
                    book: bookMap[session.bookId] || null
                }))

                setBooks(enrichedSessions)
            } catch (e) {
                console.warn('Books data not available:', e)
            }

            setLoading(false)
        }
        loadData()
    }, [])

    // Build activities by date
    const activitiesByDate = useMemo(() => {
        const result = {}

        // Create habits lookup map
        const habitsMap = {}
            ; (habits || []).forEach(h => { habitsMap[h.id] = h })

            // Process habit check-ins from checkins store
            // checkins have: habit_id, date (YYYY-MM-DD), completed
            ; (checkins || []).forEach(checkin => {
                if (!checkin.completed) return
                const dateKey = checkin.date // Already in YYYY-MM-DD format
                if (!dateKey) return

                const habit = habitsMap[checkin.habit_id]
                if (!result[dateKey]) result[dateKey] = { habits: [], focus: [], journals: [], books: [] }
                result[dateKey].habits.push({
                    id: checkin.id,
                    habitId: checkin.habit_id,
                    name: habit?.name || 'Kebiasaan',
                    completed: true
                })
            })

            // Process journals (safe iteration) - uses created_at field
            ; (journals || []).forEach(entry => {
                // Journals use created_at, not date
                const dateField = entry?.created_at || entry?.date
                if (!dateField) return
                const dateKey = dateField.split('T')[0]
                if (!result[dateKey]) result[dateKey] = { habits: [], focus: [], journals: [], books: [] }
                result[dateKey].journals.push({
                    id: entry.id,
                    title: entry.content?.substring(0, 50) || 'Journal entry',
                    mood: entry.mood
                })
            })

            // Process focus/pomodoro sessions (safe iteration)
            // Uses: date (YYYY-MM-DD), duration_minutes, completed, focus_label
            ; (focusSessions || []).forEach(session => {
                // pomodoro_sessions use 'date' field (YYYY-MM-DD format)
                const dateKey = session.date || session.started_at?.split('T')[0]
                if (!dateKey) return
                if (!result[dateKey]) result[dateKey] = { habits: [], focus: [], journals: [], books: [] }
                result[dateKey].focus.push({
                    id: session.id,
                    duration: session.duration_minutes || 0,
                    label: session.focus_label || '',
                    completed: session.completed
                })
            })

            // Process book sessions (enriched with book info) - safe iteration
            // books state now contains enriched sessions with .book property
            ; (books || []).forEach(session => {
                // Use dayKey from session, fallback to occurredAt
                const dateKey = session.dayKey || (session.occurredAt?.split('T')[0])
                if (!dateKey) return

                if (!result[dateKey]) result[dateKey] = { habits: [], focus: [], journals: [], books: [] }
                result[dateKey].books.push({
                    id: session.id,
                    bookId: session.bookId,
                    title: session.book?.title || 'Buku',
                    pages: session.unit === 'pages' ? session.delta : 0,
                    minutes: session.unit === 'minutes' ? session.delta : 0
                })
            })

        return result
    }, [habits, checkins, journals, focusSessions, books])

    // Get days for the calendar grid
    const calendarDays = useMemo(() => {
        return getDaysInMonth(year, month).map(day => {
            const dateKey = getDateKey(day.date)
            const activities = activitiesByDate[dateKey] || { habits: [], focus: [], journals: [], books: [] }
            const isToday = dateKey === getDateKey(new Date())

            return {
                ...day,
                dateKey,
                isToday,
                activities,
                hasActivity: activities.habits.length > 0 ||
                    activities.focus.length > 0 ||
                    activities.journals.length > 0 ||
                    activities.books.length > 0
            }
        })
    }, [year, month, activitiesByDate])

    // Calculate streak data for heatmap
    const streakData = useMemo(() => {
        const today = new Date()
        let currentStreak = 0
        let checkDate = new Date(today)

        // Count backward from today
        while (true) {
            const key = getDateKey(checkDate)
            const dayData = activitiesByDate[key]
            if (dayData && (dayData.habits.length > 0 || dayData.focus.length > 0 || dayData.journals.length > 0)) {
                currentStreak++
                checkDate.setDate(checkDate.getDate() - 1)
            } else {
                break
            }
        }

        return {
            currentStreak,
            activeDays: Object.keys(activitiesByDate).length
        }
    }, [activitiesByDate])

    return {
        calendarDays,
        activitiesByDate,
        streakData,
        loading,
        getDateKey
    }
}

export default useCalendarData
