import { formatCurrencyCompact } from '../atoms/Money'

// Color palette for categories
const CATEGORY_COLORS = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-blue-500',
]

/**
 * CategoryBreakdownList - List of categories with progress bars (pie chart alternative)
 */
export function CategoryBreakdownList({
    categories = [],
    type = 'expense',
    showMax = 5,
    className = ''
}) {
    const total = categories.reduce((sum, c) => sum + c.amount, 0)
    const displayCategories = categories.slice(0, showMax)
    const remaining = categories.length - showMax

    return (
        <div className={`space-y-3 ${className}`}>
            {displayCategories.length > 0 ? (
                displayCategories.map((cat, index) => {
                    const colorClass = CATEGORY_COLORS[index % CATEGORY_COLORS.length]

                    return (
                        <div key={cat.name} className="space-y-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-body">{cat.icon || '📦'}</span>
                                    <span className="text-small text-ink">{cat.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-small font-medium text-ink">
                                        {formatCurrencyCompact(cat.amount)}
                                    </span>
                                    <span className="text-tiny text-ink-muted ml-1">
                                        ({cat.percentage.toFixed(0)}%)
                                    </span>
                                </div>
                            </div>
                            <div className="h-2 bg-line rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                                    style={{ width: `${cat.percentage}%` }}
                                />
                            </div>
                        </div>
                    )
                })
            ) : (
                <div className="text-center py-6">
                    <p className="text-small text-ink-muted">
                        {type === 'expense' ? 'Belum ada pengeluaran' : 'Belum ada pemasukan'}
                    </p>
                </div>
            )}

            {remaining > 0 && (
                <p className="text-tiny text-ink-muted text-center pt-2">
                    +{remaining} kategori lainnya
                </p>
            )}

            {/* Total */}
            {displayCategories.length > 0 && (
                <div className="flex items-center justify-between pt-3 border-t border-line">
                    <span className="text-small font-medium text-ink">Total</span>
                    <span className={`text-body font-semibold ${type === 'expense' ? 'text-red-500' : 'text-green-600'}`}>
                        {formatCurrencyCompact(total)}
                    </span>
                </div>
            )}
        </div>
    )
}

export default CategoryBreakdownList
