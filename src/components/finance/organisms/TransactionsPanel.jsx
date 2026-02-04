import { useMemo } from 'react'
import TxnRow from '../molecules/TxnRow'
import { SwipeToDelete } from '../../ui/SwipeableListItem'
import { EMPTY_STATES, TXN_TYPES } from '../../../features/finance/constants'
import { IconPlus, IconWallet } from '@tabler/icons-react'

/**
 * TransactionsPanel - Tabs + grouped transaction list + empty states
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {'income' | 'expense' | 'transfer'} type
 * @property {number} amount
 * @property {string} date
 * @property {string} [category_name]
 * @property {string} [note]
 * @property {string} [merchant]
 * @property {string} account_id
 * @property {string} [to_account_id]
 */

/**
 * @param {Object} props
 * @param {Transaction[]} props.transactions
 * @param {Record<string, { name: string, type: string }>} props.accountsMap - id -> account info
 * @param {'all' | 'income' | 'expense' | 'transfer'} [props.activeTab]
 * @param {(tab: string) => void} [props.onTabChange]
 * @param {(id: string) => void} [props.onTransactionClick]
 * @param {(id: string) => void} [props.onTransactionDelete]
 * @param {() => void} [props.onAddClick]
 * @param {boolean} [props.loading]
 * @param {string} [props.className]
 */
function TransactionsPanel({
    transactions,
    accountsMap = {},
    activeTab = 'all',
    onTabChange,
    onTransactionClick,
    onTransactionDelete,
    onAddClick,
    loading = false,
    className = '',
}) {
    // Filter transactions by tab
    const filteredTransactions = useMemo(() => {
        if (activeTab === 'all') return transactions
        return transactions.filter(tx => tx.type === activeTab)
    }, [transactions, activeTab])

    // Group by date
    const groupedTransactions = useMemo(() => {
        const groups = {}

        for (const tx of filteredTransactions) {
            const date = tx.date?.split('T')[0] || 'Unknown'
            if (!groups[date]) {
                groups[date] = []
            }
            groups[date].push(tx)
        }

        // Sort dates descending
        return Object.entries(groups)
            .sort(([a], [b]) => new Date(b) - new Date(a))
    }, [filteredTransactions])

    const formatDateGroup = (dateStr) => {
        const d = new Date(dateStr)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (d.toDateString() === today.toDateString()) return 'Hari ini'
        if (d.toDateString() === yesterday.toDateString()) return 'Kemarin'

        return d.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        })
    }

    const tabs = [
        { key: 'all', label: 'Semua' },
        { key: 'income', label: 'Masuk' },
        { key: 'expense', label: 'Keluar' },
        { key: 'transfer', label: 'Transfer' },
    ]

    const isEmpty = transactions.length === 0
    const isFilterEmpty = filteredTransactions.length === 0 && !isEmpty

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Tabs - responsive on mobile */}
            {onTabChange && (
                <div className="flex gap-1 p-1 bg-paper-warm rounded-lg w-full">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => onTabChange(tab.key)}
                            className={`
                                flex-1 py-2 px-2 rounded-md text-small font-medium transition-all text-center
                                ${activeTab === tab.key
                                    ? 'bg-surface text-ink shadow-sm'
                                    : 'text-ink-muted hover:text-ink'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Loading skeleton */}
            {loading && (
                <div className="space-y-3 animate-pulse">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 bg-paper-warm rounded-xl" />
                    ))}
                </div>
            )}

            {/* Empty - No transactions at all */}
            {!loading && isEmpty && (
                <div className="text-center py-12">
                    <IconWallet size={48} stroke={1} className="mx-auto mb-4 text-ink-light" />
                    <h3 className="text-h3 text-ink mb-2">{EMPTY_STATES.noTransactions.title}</h3>
                    <p className="text-body text-ink-muted mb-4">{EMPTY_STATES.noTransactions.description}</p>
                    {onAddClick && (
                        <button onClick={onAddClick} className="btn-primary">
                            <IconPlus size={18} stroke={2} />
                            <span>{EMPTY_STATES.noTransactions.primaryCta}</span>
                        </button>
                    )}
                </div>
            )}

            {/* Empty - Filter returned no results */}
            {!loading && isFilterEmpty && (
                <div className="text-center py-8">
                    <p className="text-body text-ink-muted">{EMPTY_STATES.noFilterResults.title}</p>
                    {onTabChange && (
                        <button
                            onClick={() => onTabChange('all')}
                            className="btn-ghost mt-2"
                        >
                            Reset filter
                        </button>
                    )}
                </div>
            )}

            {/* Transaction list */}
            {!loading && !isEmpty && groupedTransactions.map(([date, txs]) => (
                <div key={date} className="space-y-2">
                    <h3 className="text-caption text-ink-muted font-medium sticky top-0 bg-surface py-1 z-10">
                        {formatDateGroup(date)}
                    </h3>
                    <div className="space-y-2">
                        {txs.map(tx => {
                            const account = accountsMap[tx.account_id]
                            const toAccount = tx.to_account_id ? accountsMap[tx.to_account_id] : null

                            return (
                                <SwipeToDelete
                                    key={tx.id}
                                    onDelete={() => onTransactionDelete?.(tx.id)}
                                    deleteLabel="Hapus"
                                >
                                    <TxnRow
                                        id={tx.id}
                                        type={tx.type}
                                        title={tx.category_name || tx.merchant || tx.note}
                                        note={tx.note}
                                        tags={tx.tags || []}
                                        attachment={tx.attachment}
                                        amount={tx.amount}
                                        date={tx.date}
                                        accountName={account?.name || 'Unknown'}
                                        accountType={account?.type || 'cash'}
                                        toAccountName={toAccount?.name}
                                        onClick={onTransactionClick}
                                        onDelete={onTransactionDelete}
                                    />
                                </SwipeToDelete>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default TransactionsPanel
