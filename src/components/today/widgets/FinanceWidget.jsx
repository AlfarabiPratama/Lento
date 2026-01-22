import { useNavigate } from 'react-router-dom'
import { IconWallet } from '@tabler/icons-react'
import { WidgetCard } from '../atoms/WidgetCard'
import { formatCurrencyCompact } from '../../finance/atoms/Money'

/**
 * FinanceWidget - Responsive: compact on mobile, full on desktop
 */
export function FinanceWidget({
  netWorth = 0,
  onQuickAdd,
  className = ''
}) {
    const navigate = useNavigate()

    return (
        <WidgetCard
            title="Keuangan"
            icon={IconWallet}
            iconColor="text-green-600"
            iconBg="bg-green-100"
            onAction={() => navigate('/more/finance')}
            className={className}
        >
            <div className="space-y-1 sm:space-y-3">
                {/* Net worth */}
                <div className="text-center py-1.5 sm:py-2 rounded sm:rounded-lg bg-green-50">
                    <p className="text-tiny sm:text-small text-green-600">Kekayaan</p>
                    <p className="text-small sm:text-body font-semibold text-green-700">
                        {formatCurrencyCompact(netWorth)}
                    </p>
                </div>

                <button
                  onClick={() => onQuickAdd?.('expense')}
                  className="btn-primary w-full py-1.5 sm:py-2 text-small sm:text-small"
                >
                  Catat transaksi
                </button>
                <div className="text-center">
                  <button
                    onClick={() => onQuickAdd?.('income')}
                    className="text-tiny sm:text-small text-ink-muted hover:text-primary"
                  >
                    Catat pemasukan
                  </button>
                </div>
            </div>
        </WidgetCard>
    )
}

export default FinanceWidget
