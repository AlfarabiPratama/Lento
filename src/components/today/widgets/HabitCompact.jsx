/**
 * HabitCompact - Compact habit widget for secondary strip
 * 
 * Shows: count completed/total + quick action
 * Min tap target: 44px for accessibility
 */

import { useNavigate } from 'react-router-dom'
import { IconChecklist, IconPlus } from '@tabler/icons-react'

export function HabitCompact({ habits = [], className = '' }) {
    const navigate = useNavigate()

    const total = habits.length
    const completed = habits.filter(h => h.checked).length

    return (
        <button
            type="button"
            onClick={() => navigate('/habits')}
            className={`widget-secondary flex items-center gap-3 min-h-[44px] hover:border-primary/30 transition-colors ${className}`}
        >
            <div className="min-w-11 min-h-11 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <IconChecklist size={16} className="text-orange-600" />
            </div>

            <div className="flex-1 text-left min-w-0">
                <p className="text-tiny text-ink-muted">Kebiasaan</p>
                {total > 0 ? (
                    <p className="text-small font-medium text-ink">
                        {completed}/{total} selesai
                    </p>
                ) : (
                    <p className="text-small text-ink-muted">Belum ada</p>
                )}
            </div>

            {total === 0 && (
                <IconPlus size={16} className="text-ink-muted" />
            )}
        </button>
    )
}

export default HabitCompact
