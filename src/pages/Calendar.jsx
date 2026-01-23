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
import { IconCalendarEvent, IconLayoutGrid, IconLayoutList, IconFilter, IconFlame, IconBulb, IconBook, IconNotebook } from '@tabler/icons-react'
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
    const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'habits' | 'focus' | 'journals' | 'books'

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

    // Filter activities based on active filter
    const filteredActivitiesByDate = useMemo(() => {
        if (!activitiesByDate || activeFilter === 'all') return activitiesByDate
        
        return Object.entries(activitiesByDate).reduce((acc, [date, activities]) => {
            const filtered = {}
            if (activeFilter === 'habits' && activities.habits?.length > 0) filtered.habits = activities.habits
            if (activeFilter === 'focus' && activities.focus?.length > 0) filtered.focus = activities.focus
            if (activeFilter === 'journals' && activities.journals?.length > 0) filtered.journals = activities.journals
            if (activeFilter === 'books' && activities.books?.length > 0) filtered.books = activities.books
            
            // Only include dates that have the filtered activity
            if (Object.keys(filtered).length > 0) {
                acc[date] = filtered
            }
            return acc
        }, {})
    }, [activitiesByDate, activeFilter])

    // Calculate summary based on view mode
    const summary = useMemo(() => {
        if (!filteredActivitiesByDate) return { habits: 0, focus: 0, journals: 0, books: 0, activeDays: 0 }

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

        Object.entries(filteredActivitiesByDate).forEach(([dateKey, activities]) => {
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
    }, [filteredActivitiesByDate, viewMode, currentDate, year, month])

    // Map calendarDays with filtered activities
    const filteredCalendarDays = useMemo(() => {
        if (!calendarDays || activeFilter === 'all') return calendarDays
        
        return calendarDays.map(day => {
            const dateKey = day.dateKey || toDateKey(day.date)
            const filteredActivities = filteredActivitiesByDate?.[dateKey] || {}
            
            // Calculate hasActivity based on filtered activities
            const hasActivity = 
                (filteredActivities.habits?.length > 0) ||
                (filteredActivities.focus?.length > 0) ||
                (filteredActivities.journals?.length > 0) ||
                (filteredActivities.books?.length > 0)
            
            return {
                ...day,
                activities: filteredActivities,
                hasActivity
            }
        })
    }, [calendarDays, filteredActivitiesByDate, activeFilter])

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

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className={`btn-sm flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                        activeFilter === 'all' 
                            ? 'bg-primary text-white' 
                            : 'bg-surface border border-line text-ink hover:bg-primary/10'
                    }`}
                >
                    <IconFilter size={16} />
                    <span>Semua</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveFilter('habits')}
                    className={`btn-sm flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                        activeFilter === 'habits' 
                            ? 'bg-primary text-white' 
                            : 'bg-surface border border-line text-ink hover:bg-primary/10'
                    }`}
                >
                    <IconFlame size={16} />
                    <span>Habit</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveFilter('focus')}
                    className={`btn-sm flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                        activeFilter === 'focus' 
                            ? 'bg-info text-white' 
                            : 'bg-surface border border-line text-ink hover:bg-info/10'
                    }`}
                >
                    <IconBulb size={16} />
                    <span>Fokus</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveFilter('journals')}
                    className={`btn-sm flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                        activeFilter === 'journals' 
                            ? 'bg-warning text-white' 
                            : 'bg-surface border border-line text-ink hover:bg-warning/10'
                    }`}
                >
                    <IconNotebook size={16} />
                    <span>Jurnal</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveFilter('books')}
                    className={`btn-sm flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                        activeFilter === 'books' 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-surface border border-line text-ink hover:bg-purple-500/10'
                    }`}
                >
                    <IconBook size={16} />
                    <span>Buku</span>
                </button>
            </div>

            {/* Desktop: 2-column layout, Mobile: stacked */}
            <div className="grid lg:grid-cols-[1fr_320px] gap-6">
                {/* Left Column: Calendar */}
                <div className="space-y-4">
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
                                calendarDays={filteredCalendarDays}
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
                                activitiesByDate={filteredActivitiesByDate}
                                selectedDate={selectedDate}
                                onSelectDate={handleSelectDate}
                                onPrevWeek={handlePrev}
                                onNextWeek={handleNext}
                            />
                        )}
                    </div>

                    {/* Day Detail Panel - Mobile only */}
                    {selectedDate && (
                        <div className="lg:hidden">
                            <DayDetail
                                dateKey={selectedDate}
                                activities={selectedActivities || { habits: [], focus: [], journals: [], books: [] }}
                                importantDate={importantDates[selectedDate]}
                                onClose={() => setSelectedDate(null)}
                            />
                        </div>
                    )}
                </div>

                {/* Right Column: Stats & Info (Desktop only) */}
                <div className="hidden lg:block space-y-4">
                    {/* Summary Stats */}
                    <div className="card">
                        <h3 className="text-h3 text-ink mb-3">Ringkasan</h3>
                        <div className="grid grid-cols-2 gap-2">
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
                    </div>

                    {/* Streak Info */}
                    <div className="card">
                        <h3 className="text-h3 text-ink mb-3">Statistik</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-body text-ink-muted">Hari Aktif</span>
                                <span className="text-h3 text-primary">{summary.activeDays}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-body text-ink-muted">Streak Saat Ini</span>
                                <span className="text-h3 text-warning">{streakData?.currentStreak || 0} 🔥</span>
                            </div>
                            {streakData?.longestStreak > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-body text-ink-muted">Streak Terpanjang</span>
                                    <span className="text-h3 text-ink">{streakData.longestStreak}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Heatmap Legend */}
                    <div className="card">
                        <h3 className="text-h3 text-ink mb-3">Intensitas</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-small">
                                <span className="text-ink-muted">Tidak ada</span>
                                <div className="w-6 h-6 rounded border border-line bg-surface"></div>
                            </div>
                            <div className="flex items-center justify-between text-small">
                                <span className="text-ink-muted">1-2 aktivitas</span>
                                <div className="w-6 h-6 rounded bg-primary/20"></div>
                            </div>
                            <div className="flex items-center justify-between text-small">
                                <span className="text-ink-muted">3-4 aktivitas</span>
                                <div className="w-6 h-6 rounded bg-primary/40"></div>
                            </div>
                            <div className="flex items-center justify-between text-small">
                                <span className="text-ink-muted">5-6 aktivitas</span>
                                <div className="w-6 h-6 rounded bg-primary/60"></div>
                            </div>
                            <div className="flex items-center justify-between text-small">
                                <span className="text-ink-muted">7+ aktivitas</span>
                                <div className="w-6 h-6 rounded bg-primary/80"></div>
                            </div>
                        </div>
                    </div>

                    {/* Day Detail Panel - Desktop */}
                    {selectedDate && (
                        <DayDetail
                            dateKey={selectedDate}
                            activities={selectedActivities || { habits: [], focus: [], journals: [], books: [] }}
                            importantDate={importantDates[selectedDate]}
                            onClose={() => setSelectedDate(null)}
                        />
                    )}
                </div>
            </div>

            {/* Mobile: Summary Stats (below calendar) */}
            <div className="lg:hidden grid grid-cols-4 gap-2">
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

            {/* Mobile: Bottom Stats */}
            <div className="lg:hidden grid grid-cols-2 gap-3">
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
