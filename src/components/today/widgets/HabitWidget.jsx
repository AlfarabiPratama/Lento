import { useNavigate } from 'react-router-dom'
import { IconChecklist, IconCheck } from '@tabler/icons-react'
import { WidgetCard } from '../atoms/WidgetCard'

/**
 * HabitWidget - Responsive: compact on mobile, full on desktop
 */
export function HabitWidget({ habits = [], onCheck, className = '' }) {
    const navigate = useNavigate()

    // Mobile: 2 habits, Desktop: 4 habits
    const displayHabits = habits.slice(0, 4)
    const remaining = habits.length - displayHabits.length

    return (
        <WidgetCard
            title="Habit Hari Ini"
            icon={IconChecklist}
            iconColor="text-orange-600"
            iconBg="bg-orange-100"
            onAction={() => navigate('/habits')}
            actionLabel="Semua"
            className={className}
        >
            {displayHabits.length > 0 ? (
                <div className="space-y-1 sm:space-y-2">
                    {/* Mobile: show 2, Desktop: show all */}
                    {displayHabits.slice(0, 2).map(habit => (
                        <button
                            key={habit.id}
                            onClick={() => onCheck?.(habit.id)}
                            className={`
                w-full flex items-center gap-1.5 sm:gap-3 p-1 sm:p-2 rounded sm:rounded-lg text-left
                transition-all hover:bg-paper-warm
                ${habit.checked ? 'opacity-60' : ''}
              `}
                        >
                            <div className={`
                w-4 h-4 sm:w-6 sm:h-6 rounded-full border sm:border-2 flex items-center justify-center
                transition-all
                ${habit.checked
                                    ? 'bg-primary border-primary text-white'
                                    : 'border-line hover:border-primary'
                                }
              `}>
                                {habit.checked && <IconCheck size={12} stroke={3} className="sm:hidden" />}
                                {habit.checked && <IconCheck size={14} stroke={3} className="hidden sm:block" />}
                            </div>
                            <span className={`text-small sm:text-body truncate ${habit.checked ? 'line-through text-ink-muted' : 'text-ink'}`}>
                                {habit.name}
                            </span>
                        </button>
                    ))}

                    {/* Desktop only: show remaining habits */}
                    <div className="hidden sm:block">
                        {displayHabits.slice(2).map(habit => (
                            <button
                                key={habit.id}
                                onClick={() => onCheck?.(habit.id)}
                                className={`
                    w-full flex items-center gap-3 p-2 rounded-lg text-left
                    transition-all hover:bg-paper-warm
                    ${habit.checked ? 'opacity-60' : ''}
                  `}
                            >
                                <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${habit.checked ? 'bg-primary border-primary text-white' : 'border-line'}
                  `}>
                                    {habit.checked && <IconCheck size={14} stroke={3} />}
                                </div>
                                <span className={`text-body ${habit.checked ? 'line-through text-ink-muted' : 'text-ink'}`}>
                                    {habit.name}
                                </span>
                            </button>
                        ))}
                    </div>

                    {remaining > 0 && (
                        <p className="text-xs sm:text-small text-ink-muted pl-1 sm:pl-2">
                            +{remaining} lainnya
                        </p>
                    )}
                </div>
            ) : (
                <div className="text-center py-2 sm:py-4">
                    <p className="text-small sm:text-small text-ink-muted">Belum ada habit</p>
                    <button
                        onClick={() => navigate('/habits')}
                        className="text-small sm:text-small text-primary hover:underline mt-1"
                    >
                        Tambah habit
                    </button>
                </div>
            )}
        </WidgetCard>
    )
}

export default HabitWidget
