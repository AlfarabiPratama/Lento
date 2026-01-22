/**
 * WeekGrid - Weekly calendar view
 * 
 * Displays 7 days (Mon-Sun) with activity indicators
 * More detailed view than month for weekly planning
 */

import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { getWeekDays, toDateKey, isSameDay, getStartOfWeek, getEndOfWeek } from '../../utils/dateUtils'

const DAYS_OF_WEEK = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

/**
 * Activity indicator row
 */
function ActivityRow({ activities }) {
    if (!activities) return null

    const items = []
    if (activities.habits?.length > 0) {
        items.push({ type: 'habit', count: activities.habits.length, color: 'bg-primary' })
    }
    if (activities.focus?.length > 0) {
        items.push({ type: 'focus', count: activities.focus.length, color: 'bg-info' })
    }
    if (activities.journals?.length > 0) {
        items.push({ type: 'journal', count: activities.journals.length, color: 'bg-warning' })
    }
    if (activities.books?.length > 0) {
        items.push({ type: 'book', count: activities.books.length, color: 'bg-purple-500' })
    }

    if (items.length === 0) return null

    return (
        <div className="flex flex-wrap gap-1 mt-1">
            {items.map((item, i) => (
                <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${item.color}`}
                    title={`${item.count} ${item.type}`}
                />
            ))}
        </div>
    )
}

/**
 * Single day cell in week view
 */
function WeekDayCell({ date, activities, isToday, isSelected, onClick }) {
    const dayNum = date.getDate()
    const dayName = DAYS_OF_WEEK[date.getDay() === 0 ? 6 : date.getDay() - 1]
    const hasActivity = activities && (
        activities.habits?.length > 0 ||
        activities.focus?.length > 0 ||
        activities.journals?.length > 0 ||
        activities.books?.length > 0
    )

    return (
        <button
            type="button"
            onClick={() => onClick(date)}
            className={`
                flex flex-col items-center p-3 rounded-xl transition-all
                ${isToday ? 'bg-primary text-white' : 'bg-paper-warm'}
                ${isSelected && !isToday ? 'ring-2 ring-primary bg-primary/10' : ''}
                ${!isToday && !isSelected ? 'hover:bg-paper-warm/80' : ''}
            `}
        >
            <span className={`text-tiny ${isToday ? 'text-white/80' : 'text-ink-muted'}`}>
                {dayName}
            </span>
            <span className={`text-h2 ${isToday ? 'text-white' : 'text-ink'}`}>
                {dayNum}
            </span>
            {hasActivity && !isToday && (
                <ActivityRow activities={activities} />
            )}
            {hasActivity && isToday && (
                <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-1" />
            )}
        </button>
    )
}

/**
 * Week Grid Component
 */
export function WeekGrid({
    currentDate,
    activitiesByDate,
    selectedDate,
    onSelectDate,
    onPrevWeek,
    onNextWeek
}) {
    const today = new Date()
    const weekDays = getWeekDays(currentDate)
    const weekStart = getStartOfWeek(currentDate)
    const weekEnd = getEndOfWeek(currentDate)

    // Format header: "23 Des - 29 Des 2024" or "28 Des 2024 - 3 Jan 2025"
    const formatWeekHeader = () => {
        const startMonth = MONTHS[weekStart.getMonth()]
        const endMonth = MONTHS[weekEnd.getMonth()]
        const startYear = weekStart.getFullYear()
        const endYear = weekEnd.getFullYear()

        if (startYear !== endYear) {
            return `${weekStart.getDate()} ${startMonth.slice(0, 3)} ${startYear} - ${weekEnd.getDate()} ${endMonth.slice(0, 3)} ${endYear}`
        }
        if (startMonth !== endMonth) {
            return `${weekStart.getDate()} ${startMonth.slice(0, 3)} - ${weekEnd.getDate()} ${endMonth.slice(0, 3)} ${startYear}`
        }
        return `${weekStart.getDate()} - ${weekEnd.getDate()} ${startMonth} ${startYear}`
    }

    return (
        <div className="space-y-4">
            {/* Week Navigation */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={onPrevWeek}
                    className="p-2 rounded-lg hover:bg-paper-warm transition-colors"
                    aria-label="Minggu sebelumnya"
                >
                    <IconChevronLeft size={20} />
                </button>

                <h3 className="text-h3 text-ink text-center">
                    {formatWeekHeader()}
                </h3>

                <button
                    type="button"
                    onClick={onNextWeek}
                    className="p-2 rounded-lg hover:bg-paper-warm transition-colors"
                    aria-label="Minggu berikutnya"
                >
                    <IconChevronRight size={20} />
                </button>
            </div>

            {/* Week Days Grid */}
            <div className="grid grid-cols-7 gap-2">
                {weekDays.map((date, i) => {
                    const dateKey = toDateKey(date)
                    const activities = activitiesByDate?.[dateKey]

                    return (
                        <WeekDayCell
                            key={i}
                            date={date}
                            activities={activities}
                            isToday={isSameDay(date, today)}
                            isSelected={selectedDate === dateKey}
                            onClick={(d) => onSelectDate({ date: d, dateKey: toDateKey(d) })}
                        />
                    )
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center text-tiny text-ink-muted pt-2">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Habit</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-info" />
                    <span>Focus</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-warning" />
                    <span>Journal</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>Books</span>
                </div>
            </div>
        </div>
    )
}

export default WeekGrid
