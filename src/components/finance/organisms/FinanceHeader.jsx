import Money from '../atoms/Money'
import SyncPill from '../atoms/SyncPill'
import { IconSearch, IconFilter } from '@tabler/icons-react'

/**
 * FinanceHeader - Top section with Net Worth + Month Summary + Sync
 */

/**
 * @param {Object} props
 * @param {number} props.netWorth
 * @param {number} props.monthIncome
 * @param {number} props.monthExpense
 * @param {'synced' | 'syncing' | 'offline' | 'error'} [props.syncState]
 * @param {string} [props.searchQuery]
 * @param {(query: string) => void} [props.onSearchChange]
 * @param {() => void} [props.onFilterClick]
 * @param {() => void} [props.onSyncClick]
 * @param {string} [props.className]
 */
function FinanceHeader({
    netWorth,
    monthIncome,
    monthExpense,
    syncState = 'synced',
    searchQuery = '',
    onSearchChange,
    onFilterClick,
    onSyncClick,
    className = '',
}) {
    const monthBalance = monthIncome - monthExpense
    const now = new Date()
    // Use short month name to prevent overflow on mobile
    const monthNameShort = now.toLocaleDateString('id-ID', { month: 'short' })

    return (
        <header className={`space-y-4 ${className}`}>
            {/* Top row: Title + Sync */}
            <div className="flex items-center justify-between">
                <h1 className="text-h1 text-ink">Keuangan</h1>
                <SyncPill state={syncState} onClick={onSyncClick} />
            </div>

            {/* Net Worth Card */}
            <div className="card bg-gradient-to-br from-primary-50 to-surface p-4 overflow-hidden">
                <p className="text-small text-ink-muted mb-1">Total Kekayaan</p>
                <div className="overflow-hidden">
                    <Money amount={netWorth} size="xl" />
                </div>

                {/* Month summary - responsive grid */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-line">
                    <div className="min-w-0 overflow-hidden">
                        <p className="text-tiny text-ink-muted truncate">{monthNameShort} masuk</p>
                        <div className="truncate"><Money amount={monthIncome} type="income" size="sm" showSign /></div>
                    </div>
                    <div className="min-w-0 overflow-hidden">
                        <p className="text-tiny text-ink-muted truncate">{monthNameShort} keluar</p>
                        <div className="truncate"><Money amount={monthExpense} type="expense" size="sm" showSign /></div>
                    </div>
                    <div className="min-w-0 overflow-hidden">
                        <p className="text-tiny text-ink-muted truncate">Sisa</p>
                        <div className="truncate"><Money amount={monthBalance} type={monthBalance >= 0 ? 'income' : 'expense'} size="sm" showSign /></div>
                    </div>
                </div>
            </div>

            {/* Search & Filter (optional) */}
            {(onSearchChange || onFilterClick) && (
                <div className="flex gap-2">
                    {onSearchChange && (
                        <div className="relative flex-1">
                            <IconSearch size={18} stroke={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                            <input
                                type="text"
                                placeholder="Cari transaksi..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="input pl-10"
                            />
                        </div>
                    )}
                    {onFilterClick && (
                        <button onClick={onFilterClick} className="btn-secondary shrink-0">
                            <IconFilter size={18} stroke={1.5} />
                            <span className="hidden sm:inline">Filter</span>
                        </button>
                    )}
                </div>
            )}
        </header>
    )
}

export default FinanceHeader
