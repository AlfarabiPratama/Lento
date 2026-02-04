/**
 * HabitCompact - Compact habit widget for secondary strip
 * 
 * Enhanced with:
 * - Progress bar showing completion %
 * - Streak indicator
 * - Percentage display
 * Min tap target: 44px for accessibility
 */

import { useNavigate } from 'react-router-dom'
import { IconChecklist, IconPlus, IconFlame } from '@tabler/icons-react'
import { HabitCompactSkeleton } from '../skeletons/WidgetSkeletons'

export function HabitCompact({ habits = [], onQuickAdd, isLoading = false, className = '' }) {
    const navigate = useNavigate()

    // Show skeleton during loading
    if (isLoading) {
        return <HabitCompactSkeleton />
    }

    const total = habits.length
    const completed = habits.filter(h => h.checked).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    // Calculate highest streak
    const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak_current || 0), 0)

    const handleQuickAdd = (e) => {
        e.stopPropagation()
        if (onQuickAdd) {
            onQuickAdd()
        } else {
            navigate('/habits')
        }
    }

    return (
        <div className={`widget-secondary group hover:border-primary/30 transition-colors ${className}`}>
            <button
                type="button"
                onClick={() => navigate('/habits')}
                className="w-full text-left"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="min-w-10 min-h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <IconChecklist size={18} className="text-orange-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                            <p className="text-tiny text-ink-muted">Kebiasaan</p>
                            {total > 0 && (
                                <span className="text-tiny font-medium text-ink">{percentage}%</span>
                            )}
                        </div>
                        {total > 0 ? (
                            <p className="text-small font-medium text-ink">
                                {completed}/{total} selesai
                            </p>
                        ) : (
                            <p className="text-small text-ink-muted">Belum ada</p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleQuickAdd}
                        className="min-w-8 min-h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 transition-colors flex-shrink-0"
                        aria-label="Tambah kebiasaan"
                        title="Tambah kebiasaan"
                    >
                        <IconPlus size={16} className="text-primary" />
                    </button>
                </div>

                {/* Progress Bar */}
                {total > 0 && (
                    <div className="mb-1.5">
                        <div className="h-1.5 bg-base-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Streak Indicator */}
                {maxStreak > 0 && (
                    <div className="flex items-center gap-1 text-tiny text-warning">
                        <IconFlame size={12} />
                        <span>{maxStreak} hari streak terbaik</span>
                    </div>
                )}
            </button>
        </div>
    )
}

export default HabitCompact
