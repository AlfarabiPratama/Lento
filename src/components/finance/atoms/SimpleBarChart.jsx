import { formatCurrencyCompact } from './Money'

/**
 * SimpleBarChart - Simple horizontal bar chart for income vs expense
 */
export function SimpleBarChart({
    income = 0,
    expense = 0,
    className = ''
}) {
    const max = Math.max(income, expense, 1)
    const incomePercent = (income / max) * 100
    const expensePercent = (expense / max) * 100

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Income bar */}
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <span className="text-small text-ink-muted">Pemasukan</span>
                    <span className="text-body font-medium text-green-600">
                        {formatCurrencyCompact(income)}
                    </span>
                </div>
                <div className="h-4 bg-line rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${incomePercent}%` }}
                    />
                </div>
            </div>

            {/* Expense bar */}
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <span className="text-small text-ink-muted">Pengeluaran</span>
                    <span className="text-body font-medium text-red-500">
                        {formatCurrencyCompact(expense)}
                    </span>
                </div>
                <div className="h-4 bg-line rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-500"
                        style={{ width: `${expensePercent}%` }}
                    />
                </div>
            </div>

            {/* Balance indicator */}
            <div className="flex items-center justify-between pt-2 border-t border-line">
                <span className="text-small font-medium text-ink">Selisih</span>
                <span className={`text-body font-semibold ${income >= expense ? 'text-green-600' : 'text-red-500'}`}>
                    {income >= expense ? '+' : ''}{formatCurrencyCompact(income - expense)}
                </span>
            </div>
        </div>
    )
}

export default SimpleBarChart
