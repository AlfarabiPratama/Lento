import { IconTarget, IconPigMoney, IconTrophy, IconCalendarMonth, IconX } from '@tabler/icons-react'
import { GoalProgressBar } from '../atoms/GoalProgressBar'
import { Money } from '../../finance/atoms/Money'
import { GOAL_TYPES } from '../../../features/goals/goalsRepo'
import { getDaysRemaining } from '../../../features/goals/goalsSelectors'

/**
 * GoalCard - Single goal card with progress
 */
export function GoalCard({
    goal,
    onClick,
    onDelete,
    className = ''
}) {
    const {
        type,
        title,
        target,
        current,
        progress,
        milestones,
        deadline,
    } = goal

    const daysRemaining = getDaysRemaining(deadline)
    const isSavings = type === GOAL_TYPES.SAVINGS
    const isComplete = milestones?.complete

    // Icon based on type
    const Icon = isSavings ? IconPigMoney : IconTarget

    /**
     * Handle delete with confirmation
     * Stop propagation to prevent opening sheet
     */
    const handleDelete = (e) => {
        e.stopPropagation()
        e.preventDefault()

        const confirmed = window.confirm(
            'Hapus target ini?\n\nTarget akan dihapus. Kamu bisa membuatnya lagi nanti.'
        )

        if (confirmed && onDelete) {
            onDelete(goal.id)
        }
    }

    return (
        <div className={`relative group ${className}`}>
            {/* Quick delete button (x) - visible on hover */}
            {onDelete && (
                <button
                    onClick={handleDelete}
                    className="absolute -top-2 -right-2 z-10
                        w-7 h-7 rounded-full
                        bg-surface border border-line shadow-sm
                        flex items-center justify-center
                        text-ink-muted hover:text-warning hover:border-warning
                        opacity-0 group-hover:opacity-100 
                        transition-all duration-200
                        focus:opacity-100 focus:ring-2 focus:ring-warning/20"
                    aria-label="Hapus target"
                >
                    <IconX size={14} stroke={2} />
                </button>
            )}

            {/* Main card button */}
            <button
                onClick={() => onClick?.(goal)}
                className={`
                    w-full p-4 rounded-xl text-left
                    bg-surface border border-line
                    hover:border-primary/50 hover:shadow-md
                    transition-all
                    ${isComplete ? 'bg-primary/5 border-primary/30' : ''}
                `}
            >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                    <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                        ${isSavings ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}
                        ${isComplete ? 'bg-yellow-100 text-yellow-600' : ''}
                    `}>
                        {isComplete ? (
                            <IconTrophy size={20} stroke={2} />
                        ) : (
                            <Icon size={20} stroke={2} />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-body font-semibold text-ink truncate group-hover:text-primary">
                            {title}
                        </h3>

                        {/* Target info */}
                        <div className="text-small text-ink-muted flex items-center gap-2">
                            {isSavings ? (
                                <>
                                    <Money amount={current} size="sm" showSign={false} />
                                    <span>/</span>
                                    <Money amount={target} size="sm" showSign={false} />
                                </>
                            ) : (
                                <>
                                    <span>{current} / {target} hari</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Completion badge */}
                    {isComplete && (
                        <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-tiny font-medium">
                            Tercapai!
                        </span>
                    )}
                </div>

                {/* Progress bar */}
                <GoalProgressBar
                    progress={progress}
                    milestones={milestones}
                    className="mb-2"
                />

                {/* Footer */}
                <div className="flex items-center justify-between text-tiny text-ink-muted">
                    <span>{Math.round(progress * 100)}%</span>

                    {deadline && daysRemaining !== null && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-small
                            ${daysRemaining < 0
                                ? 'bg-warning/10 text-warning font-medium'
                                : daysRemaining < 7
                                    ? 'bg-amber-50 text-amber-600'
                                    : 'bg-ink/5 text-ink-muted'
                            }`}
                        >
                            <IconCalendarMonth size={12} stroke={2} />
                            {daysRemaining > 0
                                ? `${daysRemaining} hari lagi`
                                : daysRemaining === 0
                                    ? 'Hari ini!'
                                    : 'Lewat deadline'
                            }
                        </span>
                    )}
                </div>
            </button>
        </div>
    )
}

export default GoalCard

