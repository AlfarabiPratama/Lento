/**
 * WeekdaySelector - Compact weekday picker for reminder days
 * 
 * Shows 7 day buttons (M T W T F S S) that user can toggle.
 */

const DAYS = [
    { value: 0, label: 'M', full: 'Minggu' },  // Sunday
    { value: 1, label: 'S', full: 'Senin' },
    { value: 2, label: 'S', full: 'Selasa' },
    { value: 3, label: 'R', full: 'Rabu' },
    { value: 4, label: 'K', full: 'Kamis' },
    { value: 5, label: 'J', full: 'Jumat' },
    { value: 6, label: 'S', full: 'Sabtu' },
]

export function WeekdaySelector({ value = [], onChange, helperText }) {
    const selectedDays = Array.isArray(value) ? value : []

    const toggleDay = (dayValue) => {
        const newDays = selectedDays.includes(dayValue)
            ? selectedDays.filter(d => d !== dayValue)
            : [...selectedDays, dayValue].sort((a, b) => a - b)
        onChange?.(newDays)
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-1">
                {DAYS.map((day) => {
                    const isSelected = selectedDays.includes(day.value)
                    return (
                        <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleDay(day.value)}
                            className={`
                                w-9 h-9 rounded-lg text-small font-medium transition-all
                                ${isSelected
                                    ? 'bg-primary text-white'
                                    : 'bg-paper-warm text-ink-muted hover:bg-primary/10'
                                }
                            `}
                            title={day.full}
                            aria-label={day.full}
                            aria-pressed={isSelected}
                        >
                            {day.label}
                        </button>
                    )
                })}
            </div>

            {helperText && (
                <p className="text-tiny text-ink-muted">{helperText}</p>
            )}
        </div>
    )
}

export default WeekdaySelector
