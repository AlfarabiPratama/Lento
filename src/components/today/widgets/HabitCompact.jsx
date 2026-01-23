/**
 * HabitCompact - Compact habit widget for secondary strip
 * 
 * Shows: count completed/total + quick action
 * Min tap target: 44px for accessibility
 */

import { useNavigate } from 'react-router-dom'
import { IconChecklist, IconPlus } from '@tabler/icons-react'

export function HabitCompact({ habits = [], onQuickAdd, className = '' }) {
    const navigate = useNavigate()

    const total = habits.length
    const completed = habits.filter(h => h.checked).length

    const handleQuickAdd = (e) => {
        e.stopPropagation()
        if (onQuickAdd) {
            onQuickAdd()
        } else {
            navigate('/habits')
        }
    }

    return (
        <div className={`widget-secondary flex items-center gap-3 min-h-[44px] ${className}`}>
            <button
                type="button"
                onClick={() => navigate('/habits')}
                className="flex-1 flex items-center gap-3 min-h-[44px] hover:bg-paper-warm transition-colors rounded-lg"
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
            </button>

            {/* Quick Add Button */}
            <button
                type="button"
                onClick={handleQuickAdd}
                className="min-w-11 min-h-11 flex items-center justify-center rounded-lg hover:bg-primary/10 transition-colors flex-shrink-0"
                aria-label="Tambah kebiasaan"
                title="Tambah kebiasaan"
            >
                <IconPlus size={20} className="text-primary" />
            </button>
        </div>
    )
}

export default HabitCompact
