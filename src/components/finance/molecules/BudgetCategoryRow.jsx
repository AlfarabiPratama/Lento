import { ProgressBar } from '../atoms/ProgressBar'
import { BudgetWarning } from '../../ui/StatusIndicator'
import { Money } from '../atoms/Money'
import { DEFAULT_CATEGORIES } from '../../../features/finance/constants'

/**
 * BudgetCategoryRow - Single budget category row
 */
export function BudgetCategoryRow({
    budgetCategory,
    onClick,
    className = ''
}) {
    const {
        category_id,
        amount_budgeted = 0,
        spent = 0,
        remaining = 0,
        progress = 0,
        status = 'ok',
    } = budgetCategory

    // Get category info from constants
    const categoryInfo = DEFAULT_CATEGORIES.find(c => c.id === category_id) || {
        label: category_id,
        icon: null,
    }

    return (
        <button
            onClick={() => onClick?.(budgetCategory)}
            className={`
        w-full flex flex-col gap-2 p-4 rounded-xl
        bg-surface border border-line
        hover:border-primary/50 transition-all
        text-left
        ${className}
      `}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-body font-medium text-ink">
                        {categoryInfo.label}
                    </span>
                    <BudgetWarning percentage={progress} size="sm" />
                </div>
                <div className="text-right">
                    <Money amount={remaining} size="sm" />
                    <div className="text-tiny text-ink-muted">
                        tersisa
                    </div>
                </div>
            </div>

            {/* Progress */}
            <ProgressBar progress={progress} status={status} />

            {/* Footer */}
            <div className="flex justify-between text-small text-ink-muted">
                <span>
                    <Money amount={spent} size="sm" showSign={false} /> terpakai
                </span>
                <span>
                    dari <Money amount={amount_budgeted} size="sm" showSign={false} />
                </span>
            </div>
        </button>
    )
}

export default BudgetCategoryRow
