import { useMemo } from 'react'
import { IconTrendingUp, IconTrendingDown, IconWallet } from '@tabler/icons-react'
import Money from '../atoms/Money'

/**
 * QuickStats - Mini summary bar untuk Finance page
 * 
 * Shows: Today's net, This month's net, Total balance across accounts
 */
export function QuickStats({ transactions = [], accounts = [] }) {
    // Calculate stats
    const stats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0]
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

        // Today's transactions
        const todayTxs = transactions.filter(tx => tx.date?.startsWith(today))
        const todayIncome = todayTxs
            .filter(tx => tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount, 0)
        const todayExpense = todayTxs
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0)
        const todayNet = todayIncome - todayExpense

        // This month's transactions
        const monthTxs = transactions.filter(tx => tx.date >= monthStart)
        const monthIncome = monthTxs
            .filter(tx => tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount, 0)
        const monthExpense = monthTxs
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0)
        const monthNet = monthIncome - monthExpense

        // Total balance
        const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance_cached || 0), 0)

        return {
            todayNet,
            todayIncome,
            todayExpense,
            monthNet,
            monthIncome,
            monthExpense,
            totalBalance,
        }
    }, [transactions, accounts])

    return (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* Today */}
            <div className="card p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                    {stats.todayNet >= 0 ? (
                        <IconTrendingUp size={16} className="text-success" stroke={2} />
                    ) : (
                        <IconTrendingDown size={16} className="text-danger" stroke={2} />
                    )}
                    <span className="text-xs sm:text-small text-ink-muted">Hari ini</span>
                </div>
                <Money 
                    amount={stats.todayNet} 
                    size="md" 
                    showSign 
                    className={stats.todayNet >= 0 ? 'text-success' : 'text-danger'}
                />
                <p className="text-xs text-ink-muted mt-1 hidden sm:block">
                    {stats.todayIncome > 0 && `↑ ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(stats.todayIncome)} `}
                    {stats.todayExpense > 0 && `↓ ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(stats.todayExpense)}`}
                </p>
            </div>

            {/* This Month */}
            <div className="card p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                    {stats.monthNet >= 0 ? (
                        <IconTrendingUp size={16} className="text-success" stroke={2} />
                    ) : (
                        <IconTrendingDown size={16} className="text-danger" stroke={2} />
                    )}
                    <span className="text-xs sm:text-small text-ink-muted">Bulan ini</span>
                </div>
                <Money 
                    amount={stats.monthNet} 
                    size="md" 
                    showSign 
                    className={stats.monthNet >= 0 ? 'text-success' : 'text-danger'}
                />
                <p className="text-xs text-ink-muted mt-1 hidden sm:block">
                    {stats.monthIncome > 0 && `↑ ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(stats.monthIncome)} `}
                    {stats.monthExpense > 0 && `↓ ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(stats.monthExpense)}`}
                </p>
            </div>

            {/* Total Balance */}
            <div className="card p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                    <IconWallet size={16} className="text-primary" stroke={2} />
                    <span className="text-xs sm:text-small text-ink-muted">Total Saldo</span>
                </div>
                <Money 
                    amount={stats.totalBalance} 
                    size="md" 
                    className="text-primary"
                />
                <p className="text-xs text-ink-muted mt-1 hidden sm:block">
                    {accounts.length} dompet
                </p>
            </div>
        </div>
    )
}

export default QuickStats
