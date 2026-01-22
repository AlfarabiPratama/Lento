/**
 * Calendar Page - Full calendar view with activity tracking
 * 
 * Features:
 * - Month & Week view toggle
 * - Activity indicators per day
 * - Day detail view on click
 * - Swipe gestures for navigation (mobile)
 * - "Hari Ini" quick navigation
 * - Monthly/Weekly summary stats
 */

import { useState, useCallback, useMemo, useRef } from 'react'
import { IconCalendarEvent, IconLayoutGrid, IconLayoutList } from '@tabler/icons-react'
import { CalendarGrid } from '../components/calendar/CalendarGrid'
import { WeekGrid } from '../components/calendar/WeekGrid'
import { DayDetail } from '../components/calendar/DayDetail'
import { useCalendarData } from '../hooks/useCalendarData'
import { useImportantDates } from '../hooks/useImportantDates'
import { goPrev, goNext, toDateKey, isSameDay, getStartOfWeek, getEndOfWeek } from '../utils/dateUtils'

const VIEW_MODES = {
    MONTH: 'month',
    WEEK: 'week'
}

export function Calendar() {
    const today = new Date()
    const [viewMode, setViewMode] = useState(VIEW_MODES.MONTH)
    const [currentDate, setCurrentDate] = useState(today)
    const [selectedDate, setSelectedDate] = useState(null)
    const [slideDirection, setSlideDirection] = useState(null) // 'prev' | 'next' | null

    // For month view compatibility
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const { calendarDays, activitiesByDate, streakData, loading } = useCalendarData(year, month)
    const { importantDates } = useImportantDates()

    // Swipe handling
    const touchStartX = useRef(0)
    const touchEndX = useRef(0)
    const minSwipeDistance = 50

    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX
    }, [])

    const handleTouchMove = useCallback((e) => {
        touchEndX.current = e.touches[0].clientX
    }, [])

    const handleTouchEnd = useCallback(() => {
        const distance = touchStartX.current - touchEndX.current
        if (Math.abs(distance) > minSwipeDistance) {
            if (distance > 0) {
                handleNext()
            } else {
                handlePrev()
            }
        }
    }, [viewMode])

    const handlePrev = useCallback(() => {
        setSlideDirection('prev')
        setCurrentDate(d => goPrev(d, viewMode))
        setSelectedDate(null)
        // Reset animation after it plays
        setTimeout(() => setSlideDirection(null), 250)
    }, [viewMode])

    const handleNext = useCallback(() => {
        setSlideDirection('next')
        setCurrentDate(d => goNext(d, viewMode))
        setSelectedDate(null)
        // Reset animation after it plays
        setTimeout(() => setSlideDirection(null), 250)
    }, [viewMode])

    const handleToday = useCallback(() => {
        setCurrentDate(new Date())
        setSelectedDate(null)
    }, [])

    const handleToggleView = useCallback(() => {
        setViewMode(prev => prev === VIEW_MODES.MONTH ? VIEW_MODES.WEEK : VIEW_MODES.MONTH)
    }, [])

    const handleJumpToMonth = useCallback((newYear, newMonth) => {
        setCurrentDate(new Date(newYear, newMonth, 1))
        setSelectedDate(null)
    }, [])

    const handleSelectDate = useCallback((day) => {
        const dateKey = day.dateKey || toDateKey(day.date)
        setSelectedDate(prev => prev === dateKey ? null : dateKey)
    }, [])

    const selectedActivities = selectedDate ? (activitiesByDate?.[selectedDate] || null) : null

    // Calculate summary based on view mode
    const summary = useMemo(() => {
        if (!activitiesByDate) return { habits: 0, focus: 0, journals: 0, books: 0, activeDays: 0 }

        let habits = 0, focus = 0, journals = 0, books = 0, activeDays = 0

        // Determine date range based on view mode
        let startDate, endDate
        if (viewMode === VIEW_MODES.WEEK) {
            startDate = getStartOfWeek(currentDate)
            endDate = getEndOfWeek(currentDate)
        } else {
            startDate = new Date(year, month, 1)
            endDate = new Date(year, month + 1, 0)
        }

        const startKey = toDateKey(startDate)
        const endKey = toDateKey(endDate)

        Object.entries(activitiesByDate).forEach(([dateKey, activities]) => {
            if (dateKey >= startKey && dateKey <= endKey) {
                const hasAny =
                    activities.habits?.length > 0 ||
                    activities.focus?.length > 0 ||
                    activities.journals?.length > 0 ||
                    activities.books?.length > 0

                if (hasAny) activeDays++
                habits += activities.habits?.length || 0
                focus += activities.focus?.length || 0
                journals += activities.journals?.length || 0
                books += activities.books?.length || 0
            }
        })

        return { habits, focus, journals, books, activeDays }
    }, [activitiesByDate, viewMode, currentDate, year, month])

    // Check if current view is today
    const isCurrentPeriod = viewMode === VIEW_MODES.MONTH
        ? (year === today.getFullYear() && month === today.getMonth())
        : (toDateKey(getStartOfWeek(currentDate)) === toDateKey(getStartOfWeek(today)))

    // Loading state
    if (loading || !calendarDays) {
        return (
            <div className="space-y-6 animate-in">
                <header>
                    <h1 className="text-h1 text-ink">Kalender</h1>
                    <p className="text-body text-ink-muted mt-1">Lihat jejak aktivitasmu.</p>
                </header>
                <div className="card">
                    <div className="h-80 flex items-center justify-center">
                        <span className="text-ink-muted">Memuat kalender...</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in">
            {/* Header */}
            <header className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h1 className="text-h1 text-ink">Kalender</h1>
                    <p className="text-body text-ink-muted mt-1">Lihat jejak aktivitasmu.</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Streak badge */}
                    {streakData?.currentStreak > 0 && (
                        <div className="tag-primary hidden sm:flex">
                            🔥 {streakData.currentStreak} hari
                        </div>
                    )}

                    {/* View Mode Toggle */}
                    <button
                        type="button"
                        onClick={handleToggleView}
                        className="btn-sm bg-surface border border-line flex items-center gap-1.5"
                        aria-label={viewMode === VIEW_MODES.MONTH ? 'Ganti ke tampilan minggu' : 'Ganti ke tampilan bulan'}
                    >
                        {viewMode === VIEW_MODES.MONTH ? (
                            <>
                                <IconLayoutList size={16} />
                                <span className="hidden sm:inline">Minggu</span>
                            </>
                        ) : (
                            <>
                                <IconLayoutGrid size={16} />
                                <span className="hidden sm:inline">Bulan</span>
                            </>
                        )}
                    </button>

                    {/* Hari Ini button */}
                    {!isCurrentPeriod && (
                        <button
                            type="button"
                            onClick={handleToday}
                            className="btn-sm bg-primary text-white flex items-center gap-1.5"
                        >
                            <IconCalendarEvent size={16} />
                            <span className="hidden sm:inline">Hari Ini</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-2">
                <div className="bg-primary/10 rounded-xl p-3 text-center">
                    <p className="text-h2 text-primary">{summary.habits}</p>
                    <p className="text-tiny text-ink-muted">Habit</p>
                </div>
                <div className="bg-info/10 rounded-xl p-3 text-center">
                    <p className="text-h2 text-info">{summary.focus}</p>
                    <p className="text-tiny text-ink-muted">Fokus</p>
                </div>
                <div className="bg-warning/10 rounded-xl p-3 text-center">
                    <p className="text-h2 text-warning">{summary.journals}</p>
                    <p className="text-tiny text-ink-muted">Jurnal</p>
                </div>
                <div className="bg-purple-500/10 rounded-xl p-3 text-center">
                    <p className="text-h2 text-purple-500">{summary.books}</p>
                    <p className="text-tiny text-ink-muted">Buku</p>
                </div>
            </div>

            {/* Calendar Grid with Swipe */}
            <div
                className={`card ${slideDirection === 'next' ? 'calendar-slide-next' :
                    slideDirection === 'prev' ? 'calendar-slide-prev' : ''
                    }`}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {viewMode === VIEW_MODES.MONTH ? (
                    <CalendarGrid
                        year={year}
                        month={month}
                        calendarDays={calendarDays}
                        selectedDate={selectedDate}
                        onSelectDate={handleSelectDate}
                        onPrevMonth={handlePrev}
                        onNextMonth={handleNext}
                        onJumpToMonth={handleJumpToMonth}
                        importantDates={importantDates}
                    />
                ) : (
                    <WeekGrid
                        currentDate={currentDate}
                        activitiesByDate={activitiesByDate}
                        selectedDate={selectedDate}
                        onSelectDate={handleSelectDate}
                        onPrevWeek={handlePrev}
                        onNextWeek={handleNext}
                    />
                )}
            </div>

            {/* Day Detail Panel */}
            {selectedDate && (
                <DayDetail
                    dateKey={selectedDate}
                    activities={selectedActivities || { habits: [], focus: [], journals: [], books: [] }}
                    importantDate={importantDates[selectedDate]}
                    onClose={() => setSelectedDate(null)}
                />
            )}

            {/* Bottom Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="card text-center py-4">
                    <p className="text-h1 text-primary">{summary.activeDays}</p>
                    <p className="text-tiny text-ink-muted">
                        Hari Aktif {viewMode === VIEW_MODES.WEEK ? 'Minggu Ini' : 'Bulan Ini'}
                    </p>
                </div>
                <div className="card text-center py-4">
                    <p className="text-h1 text-warning">{streakData?.currentStreak || 0}</p>
                    <p className="text-tiny text-ink-muted">Streak Saat Ini</p>
                </div>
            </div>
        </div>
    )
}

export default Calendar
