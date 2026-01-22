import { IconPlus, IconLoader2 } from '@tabler/icons-react'
import { GoalCard } from '../molecules/GoalCard'
import { FilterChip } from '../../search/atoms/FilterChip'

/**
 * GoalsList - List of goals with filters
 */
export function GoalsList({
    goals,
    filter,
    onFilterChange,
    onGoalClick,
    onDeleteGoal,
    onAddGoal,
    loading = false,
    className = ''
}) {
    const filters = [
        { id: 'active', label: 'Aktif' },
        { id: 'completed', label: 'Tercapai' },
        { id: 'all', label: 'Semua' },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <IconLoader2 size={24} className="animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className={`space-y-4 pb-24 ${className}`}>
            {/* Filter chips */}
            <div className="flex items-center gap-2">
                {filters.map(f => (
                    <FilterChip
                        key={f.id}
                        label={f.label}
                        selected={filter === f.id}
                        onClick={() => onFilterChange(f.id)}
                    />
                ))}
            </div>

            {/* Goals list */}
            {goals.length > 0 ? (
                <div className="space-y-3">
                    {goals.map(goal => (
                        <GoalCard
                            key={goal.id}
                            goal={goal}
                            onClick={onGoalClick}
                            onDelete={onDeleteGoal}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <IconPlus size={32} className="text-primary" />
                    </div>
                    <p className="text-body text-ink-muted mb-2">
                        {filter === 'completed'
                            ? 'Belum ada target yang tercapai'
                            : 'Belum ada target'
                        }
                    </p>
                    <p className="text-small text-ink-muted mb-4">
                        Mulai dengan satu target kecil dulu!
                    </p>
                    <button
                        onClick={onAddGoal}
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        <IconPlus size={18} stroke={2} />
                        <span>Tambah Target</span>
                    </button>
                </div>
            )}

            {/* Add button (if has goals) */}
            {goals.length > 0 && (
                <button
                    onClick={onAddGoal}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-line
                     hover:border-primary hover:bg-primary/5 transition-all
                     flex items-center justify-center gap-2 text-ink-muted hover:text-primary"
                >
                    <IconPlus size={20} stroke={2} />
                    <span>Tambah Target</span>
                </button>
            )}
        </div>
    )
}

export default GoalsList
