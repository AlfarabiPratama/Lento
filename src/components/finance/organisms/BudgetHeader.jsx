import { IconChevronLeft, IconChevronRight, IconCopy } from '@tabler/icons-react'
import { Money } from '../atoms/Money'
import { ProgressBar } from '../atoms/ProgressBar'
import { ShareButton } from '../../ui/ShareButton'
import { buildBudgetShareText } from '../../../lib/share'

/**
 * BudgetHeader - Month selector and summary
 */
export function BudgetHeader({
    currentMonth,
    summary,
    topCategories = [],
    onPrevMonth,
    onNextMonth,
    onCopyPrevious,
    className = ''
}) {
    const { totalBudgeted, totalSpent, totalRemaining } = summary

    // Format month display
    const formatMonth = (monthStr) => {
        const [year, month] = monthStr.split('-')
        const date = new Date(year, parseInt(month) - 1, 1)
        return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    }

    const monthLabel = formatMonth(currentMonth)

    // Calculate overall progress
    const overallProgress = totalBudgeted > 0 ? totalSpent / totalBudgeted : 0
    const overallStatus = overallProgress > 1 ? 'over' : overallProgress >= 0.8 ? 'near' : 'ok'

    // Build share text
    const shareText = buildBudgetShareText({
        monthLabel,
        totalBudgeted,
        totalSpent,
        remaining: totalRemaining,
        topCategories
    })

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Month selector */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onPrevMonth}
                    className="p-2 rounded-lg hover:bg-paper-warm transition-colors"
                    aria-label="Bulan sebelumnya"
                >
                    <IconChevronLeft size={20} stroke={2} className="text-ink-muted" />
                </button>

                <div className="flex items-center gap-2">
                    <h2 className="text-h2 text-ink font-semibold">
                        {monthLabel}
                    </h2>
                    <ShareButton
                        title={`Budget ${monthLabel} — Lento`}
                        text={shareText}
                        size="sm"
                    />
                </div>

                <button
                    onClick={onNextMonth}
                    className="p-2 rounded-lg hover:bg-paper-warm transition-colors"
                    aria-label="Bulan selanjutnya"
                >
                    <IconChevronRight size={20} stroke={2} className="text-ink-muted" />
                </button>
            </div>

            {/* Summary card */}
            <div className="card space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-small text-ink-muted">Total Budget</p>
                        <Money amount={totalBudgeted} size="lg" showSign={false} />
                    </div>
                    <div className="text-right">
                        <p className="text-small text-ink-muted">Sisa</p>
                        <Money
                            amount={totalRemaining}
                            size="lg"
                            type={totalRemaining >= 0 ? 'positive' : 'negative'}
                        />
                    </div>
                </div>

                <ProgressBar progress={overallProgress} status={overallStatus} showLabel />

                <div className="flex justify-between text-small text-ink-muted">
                    <span>
                        Terpakai: <Money amount={totalSpent} size="sm" showSign={false} />
                    </span>
                    {onCopyPrevious && (
                        <button
                            onClick={onCopyPrevious}
                            className="flex items-center gap-1 text-primary hover:underline"
                        >
                            <IconCopy size={14} stroke={2} />
                            <span>Copy dari sebelumnya</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BudgetHeader

