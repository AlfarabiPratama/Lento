/**
 * FinanceCompact - Compact finance widget for secondary strip
 * 
 * Enhanced with:
 * - Monthly budget remaining
 * - Visual indicator (on track / over budget)
 * - Better formatting
 * Min tap target: 44px for accessibility
 */

import { useNavigate } from 'react-router-dom'
import { IconWallet, IconPlus, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react'
import { formatCurrencyCompact } from '../../finance/atoms/Money'
import { useCurrentMonthSummary } from '../../../hooks/useFinance'
import { FinanceCompactSkeleton } from '../skeletons/WidgetSkeletons'

export function FinanceCompact({
    todayExpense = 0,
    onQuickAdd,
    isLoading = false,
    className = ''
}) {
    const navigate = useNavigate()
    const { summary, isLoading: summaryLoading } = useCurrentMonthSummary()

    // Show skeleton during loading
    if (isLoading || summaryLoading) {
        return <FinanceCompactSkeleton />
    }

    // Calculate budget status
    const monthlyBudget = 5000000 // TODO: Get from user settings
    const totalExpense = summary?.expense || 0
    const remaining = monthlyBudget - totalExpense
    const percentUsed = monthlyBudget > 0 ? (totalExpense / monthlyBudget) * 100 : 0
    const isOverBudget = remaining < 0
    const isNearLimit = !isOverBudget && percentUsed > 80

    return (
        <div className={`widget-secondary group hover:border-primary/30 transition-colors ${className}`}>
            <button
                type="button"
                onClick={() => navigate('/more/finance')}
                className="w-full text-left"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className={`min-w-10 min-h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isOverBudget ? 'bg-red-100' : isNearLimit ? 'bg-yellow-100' : 'bg-green-100'
                    }`}>
                        <IconWallet size={18} className={`${
                            isOverBudget ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'
                        }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-tiny text-ink-muted">Pengeluaran Hari Ini</p>
                        <p className="text-small font-medium text-ink">
                            {formatCurrencyCompact(todayExpense)}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            onQuickAdd?.('expense')
                        }}
                        className="min-w-8 min-h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 transition-colors flex-shrink-0"
                        aria-label="Catat transaksi"
                    >
                        <IconPlus size={16} className="text-primary" />
                    </button>
                </div>

                {/* Budget Remaining */}
                <div className={`flex items-center justify-between text-tiny ${
                    isOverBudget ? 'text-danger' : isNearLimit ? 'text-warning' : 'text-success'
                }`}>
                    <span className="flex items-center gap-1">
                        {isOverBudget ? (
                            <IconTrendingDown size={12} />
                        ) : (
                            <IconTrendingUp size={12} />
                        )}
                        <span>
                            {isOverBudget ? 'Over budget' : 'Budget tersisa'}
                        </span>
                    </span>
                    <span className="font-medium">
                        {formatCurrencyCompact(Math.abs(remaining))}
                    </span>
                </div>
            </button>
        </div>
    )
}

export default FinanceCompact
