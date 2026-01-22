/**
 * MiniCalendar - Compact calendar widget for Today page
 * 
 * Shows a small heatmap-style calendar with activity indicators.
 * Clicking navigates to full calendar page.
 */

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconCalendar, IconFlame } from '@tabler/icons-react'
import { useCalendarData, getDaysInMonth } from '../../hooks/useCalendarData'

function getDateKey(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

export function MiniCalendar() {
    const navigate = useNavigate()
    const today = new Date()
    const { activitiesByDate, streakData, loading } = useCalendarData(
        today.getFullYear(),
        today.getMonth()
    )

    // Get current week (7 days centered on today, or starting from Sunday)
    const currentWeek = useMemo(() => {
        const days = []
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay()) // Start from Sunday

        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek)
            d.setDate(startOfWeek.getDate() + i)
            const dateKey = getDateKey(d)
            const activities = activitiesByDate[dateKey]
            const hasActivity = activities && (
                activities.habits?.length > 0 ||
                activities.focus?.length > 0 ||
                activities.journals?.length > 0 ||
                activities.books?.length > 0
            )

            days.push({
                date: d,
                dateKey,
                dayName: ['M', 'S', 'S', 'R', 'K', 'J', 'S'][d.getDay()],
                isToday: dateKey === getDateKey(today),
                hasActivity,
                activityLevel: hasActivity ? getActivityLevel(activities) : 0
            })
        }
        return days
    }, [activitiesByDate, today])

    function getActivityLevel(activities) {
        if (!activities) return 0
        const count =
            (activities.habits?.length || 0) +
            (activities.focus?.length || 0) +
            (activities.journals?.length || 0) +
            (activities.books?.length || 0)
        if (count >= 4) return 3
        if (count >= 2) return 2
        return 1
    }

    const levelColors = {
        0: 'bg-paper-warm',
        1: 'bg-primary/30',
        2: 'bg-primary/60',
        3: 'bg-primary'
    }

    if (loading) {
        return (
            <div className="card py-4">
                <div className="h-16 flex items-center justify-center">
                    <span className="text-ink-muted text-small">Memuat...</span>
                </div>
            </div>
        )
    }

    return (
        <button
            type="button"
            onClick={() => navigate('/calendar')}
            className="card block w-full text-left hover:border-primary/30 transition-colors group"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <IconCalendar size={18} className="text-primary" />
                    <span className="text-h3 text-ink">Minggu Ini</span>
                </div>
                {streakData.currentStreak > 0 && (
                    <div className="flex items-center gap-1 text-tiny text-warning">
                        <IconFlame size={14} />
                        <span>{streakData.currentStreak} hari</span>
                    </div>
                )}
            </div>

            {/* Week Grid */}
            <div className="grid grid-cols-7 gap-1.5">
                {currentWeek.map((day, i) => (
                    <div key={i} className="text-center">
                        <span className="text-tiny text-ink-muted">{day.dayName}</span>
                        <div
                            className={`
                                mt-1 w-8 h-8 mx-auto rounded-lg flex items-center justify-center
                                text-tiny font-medium transition-all
                                ${day.isToday ? 'ring-2 ring-primary ring-offset-2' : ''}
                                ${levelColors[day.activityLevel]}
                                ${day.activityLevel > 0 && !day.isToday ? 'text-white' : 'text-ink'}
                                ${day.activityLevel === 0 && day.isToday ? 'bg-primary text-white' : ''}
                            `}
                        >
                            {day.date.getDate()}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer hint */}
            <p className="text-tiny text-ink-muted text-center mt-3 group-hover:text-primary transition-colors">
                Lihat kalender lengkap →
            </p>
        </button>
    )
}

export default MiniCalendar
