/**
 * CalendarGrid - Reusable calendar grid component
 * 
 * Displays a monthly calendar with activity indicators.
 * Supports click interactions for day detail view.
 */

import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { YearMonthPicker } from './YearMonthPicker'

const DAYS_OF_WEEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

/**
 * Activity dot indicator
 */
function ActivityDot({ type }) {
    const colors = {
        habit: 'bg-primary',
        focus: 'bg-info',
        journal: 'bg-warning',
        book: 'bg-purple-500'
    }
    return <div className={`w-1.5 h-1.5 rounded-full ${colors[type] || 'bg-ink-muted'}`} />
}

/**
 * Get intensity level based on activity count
 * 0 = none, 1-2 = low, 3-4 = mid, 5-6 = high, 7+ = max
 */
function getIntensityClass(activities) {
    if (!activities) return ''

    const count =
        (activities.habits?.length || 0) +
        (activities.focus?.length || 0) +
        (activities.journals?.length || 0) +
        (activities.books?.length || 0)

    if (count === 0) return ''
    if (count <= 2) return 'calendar-intensity-low'
    if (count <= 4) return 'calendar-intensity-mid'
    if (count <= 6) return 'calendar-intensity-high'
    return 'calendar-intensity-max'
}

/**
 * Single day cell in the calendar
 */
function DayCell({ day, isSelected, onClick, importantDate }) {
    const { date, isCurrentMonth, isToday, activities, hasActivity } = day
    const dayNum = date.getDate()
    const hasImportant = Boolean(importantDate)
    const intensityClass = isCurrentMonth && !isToday && !isSelected && !hasImportant
        ? getIntensityClass(activities)
        : ''

    return (
        <button
            type="button"
            onClick={() => onClick(day)}
            className={`
                relative w-full aspect-square flex flex-col items-center justify-center
                rounded-lg transition-all duration-150
                ${isCurrentMonth ? 'text-ink' : 'text-ink-light'}
                ${isToday ? 'bg-primary text-white font-medium' : ''}
                ${isSelected && !isToday ? 'bg-primary/10 ring-2 ring-primary' : ''}
                ${!isToday && !isSelected && !hasImportant && !intensityClass ? 'hover:bg-paper-warm' : ''}
                ${hasImportant && !isToday ? 'bg-warning/10' : ''}
                ${intensityClass}
            `}
            title={importantDate?.label}
        >
            {/* Important date icon (top-right corner) */}
            {hasImportant && (
                <span className="absolute top-0.5 right-0.5 text-[10px] leading-none">
                    {importantDate.icon || '📌'}
                </span>
            )}

            <span className="text-small">{dayNum}</span>

            {/* Activity indicators */}
            {hasActivity && isCurrentMonth && !isToday && (
                <div className="flex gap-0.5 mt-0.5">
                    {activities.habits?.length > 0 && <ActivityDot type="habit" />}
                    {activities.focus?.length > 0 && <ActivityDot type="focus" />}
                    {activities.journals?.length > 0 && <ActivityDot type="journal" />}
                    {activities.books?.length > 0 && <ActivityDot type="book" />}
                </div>
            )}

            {/* Today indicator with activity dots */}
            {isToday && hasActivity && (
                <div className="flex gap-0.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                </div>
            )}
        </button>
    )
}

/**
 * Calendar Grid Component
 */
export function CalendarGrid({
    year,
    month,
    calendarDays,
    selectedDate,
    onSelectDate,
    onPrevMonth,
    onNextMonth,
    onJumpToMonth,
    importantDates = {}
}) {
    return (
        <div className="space-y-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={onPrevMonth}
                    className="p-2 rounded-lg hover:bg-paper-warm transition-colors"
                    aria-label="Bulan sebelumnya"
                >
                    <IconChevronLeft size={20} />
                </button>

                {onJumpToMonth ? (
                    <YearMonthPicker
                        year={year}
                        month={month}
                        onChange={(y, m) => onJumpToMonth(y, m)}
                    />
                ) : (
                    <h3 className="text-h2 text-ink">
                        {MONTHS[month]} {year}
                    </h3>
                )}

                <button
                    type="button"
                    onClick={onNextMonth}
                    className="p-2 rounded-lg hover:bg-paper-warm transition-colors"
                    aria-label="Bulan berikutnya"
                >
                    <IconChevronRight size={20} />
                </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1">
                {DAYS_OF_WEEK.map(day => (
                    <div
                        key={day}
                        className="text-center text-caption text-ink-muted py-2"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => (
                    <DayCell
                        key={i}
                        day={day}
                        isSelected={selectedDate === day.dateKey}
                        onClick={onSelectDate}
                        importantDate={importantDates[day.dateKey]}
                    />
                ))}
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

export default CalendarGrid
