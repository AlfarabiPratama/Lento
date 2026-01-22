/**
 * FinanceCompact - Compact finance widget for secondary strip
 * 
 * Shows: today's spending + quick add
 * Min tap target: 44px for accessibility
 */

import { useNavigate } from 'react-router-dom'
import { IconWallet, IconPlus } from '@tabler/icons-react'
import { formatCurrencyCompact } from '../../finance/atoms/Money'

export function FinanceCompact({
    todayExpense = 0,
    onQuickAdd,
    className = ''
}) {
    const navigate = useNavigate()

    return (
        <div className={`widget-secondary flex items-center gap-3 min-h-[44px] ${className}`}>
            <button
                type="button"
                onClick={() => navigate('/more/finance')}
                className="flex items-center gap-3 flex-1 min-w-0"
            >
                <div className="min-w-11 min-h-11 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <IconWallet size={16} className="text-green-600" />
                </div>

                <div className="flex-1 text-left min-w-0">
                    <p className="text-tiny text-ink-muted">Pengeluaran</p>
                    <p className="text-small font-medium text-ink">
                        {formatCurrencyCompact(todayExpense)}
                    </p>
                </div>
            </button>

            <button
                type="button"
                onClick={() => onQuickAdd?.('expense')}
                className="p-2 rounded-lg hover:bg-paper-cream transition-colors"
                aria-label="Catat transaksi"
            >
                <IconPlus size={16} className="text-ink-muted" />
            </button>
        </div>
    )
}

export default FinanceCompact
