import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { IconArrowLeft, IconPlus, IconMinus, IconArrowsExchange, IconPigMoney, IconReceipt, IconChartBar, IconRepeat } from '@tabler/icons-react'
import { PullToRefresh } from '../components/ui/PullToRefresh'
import { haptics } from '../utils/haptics'

// Organisms
import FinanceHeader from '../components/finance/organisms/FinanceHeader'
import TransactionsPanel from '../components/finance/organisms/TransactionsPanel'
import TxnSheet from '../components/finance/organisms/TxnSheet'
import BudgetPanel from '../components/finance/organisms/BudgetPanel'
import InsightsPanel from '../components/finance/organisms/InsightsPanel'
import RecurringManager from '../components/finance/organisms/RecurringManager'
import BillsPanel from '../components/finance/organisms/BillsPanel'

// Molecules
import AccountCard from '../components/finance/molecules/AccountCard'
import AccountChip, { AddAccountChip } from '../components/finance/molecules/AccountChip'

// Hooks
import { useAccounts, useTransactions, useCurrentMonthSummary, useFinanceCategories } from '../hooks/useFinance'
import { useRecurringGenerator } from '../hooks/useRecurring'

// Constants
import { BREAKPOINTS, EMPTY_STATES } from '../features/finance/constants'

// Components (existing)
import AddAccountModal from '../components/AddAccountModal'

/**
 * FinancePage - Responsive finance management
 * 
 * Desktop (≥1024px): 2-pane layout (accounts left, transactions right)
 * Mobile (<600px): Stacked layout with bottom sheet for forms
 */
function FinancePage() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    // Data hooks
    const { accounts, netWorth, refresh: refreshAccounts } = useAccounts()
    const { transactions, create: createTransaction, remove: removeTransaction, refresh: refreshTransactions } = useTransactions()
    const { summary, refresh: refreshSummary } = useCurrentMonthSummary()
    const { categories } = useFinanceCategories()

    // Run recurring generator on mount
    useRecurringGenerator()

    // UI state
    const [mainTab, setMainTab] = useState('transactions') // 'transactions' | 'budget'
    const [selectedAccountId, setSelectedAccountId] = useState(null)
    const [activeTab, setActiveTab] = useState('all')
    const [showAddAccount, setShowAddAccount] = useState(false)
    const [showTxnSheet, setShowTxnSheet] = useState(false)
    const [txnSheetType, setTxnSheetType] = useState('expense')
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)

    // Handle ?open=txn query param from shortcuts and ?tab=bills from notifications
    useEffect(() => {
        const openParam = searchParams.get('open')
        const typeParam = searchParams.get('type')
        const tabParam = searchParams.get('tab')

        if (openParam === 'txn') {
            setTxnSheetType(typeParam === 'income' ? 'income' : 'expense')
            setShowTxnSheet(true)
            // Clear the params after handling
            setSearchParams({}, { replace: true })
        }
        
        if (tabParam === 'bills') {
            setMainTab('bills')
            // Clear the param after handling
            setSearchParams({}, { replace: true })
        }
    }, [searchParams, setSearchParams])

    // Responsive breakpoints
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const isMobile = windowWidth < BREAKPOINTS.mobile
    const isDesktop = windowWidth >= BREAKPOINTS.desktop

    // Create accounts map for TransactionsPanel
    const accountsMap = useMemo(() => {
        const map = {}
        for (const acc of accounts) {
            map[acc.id] = { name: acc.name, type: acc.type }
        }
        return map
    }, [accounts])

    // Pull-to-refresh handler
    const handleRefresh = async () => {
        await Promise.all([
            refreshAccounts(),
            refreshTransactions(),
            refreshSummary()
        ])
        haptics.light()
    }

    // Filter transactions by selected account
    const displayedTransactions = useMemo(() => {
        if (!selectedAccountId) return transactions
        return transactions.filter(
            t => t.account_id === selectedAccountId || t.to_account_id === selectedAccountId
        )
    }, [transactions, selectedAccountId])

    // Handlers
    const handleAddTransaction = (type) => {
        setTxnSheetType(type)
        setShowTxnSheet(true)
    }

    const handleTransactionSubmit = async (data) => {
        await createTransaction(data)
        await Promise.all([refreshAccounts(), refreshTransactions(), refreshSummary()])
    }

    const handleTransactionDelete = async (id) => {
        await removeTransaction(id)
        await Promise.all([refreshAccounts(), refreshTransactions(), refreshSummary()])
    }

    const handleAccountSuccess = () => {
        setShowAddAccount(false)
        refreshAccounts()
    }

    // Main tab options
    const mainTabs = [
        { id: 'transactions', label: 'Transaksi', icon: IconReceipt },
        { id: 'budget', label: 'Anggaran', icon: IconPigMoney },
        { id: 'bills', label: 'Tagihan', icon: IconReceipt },
        { id: 'recurring', label: 'Berulang', icon: IconRepeat },
        { id: 'insights', label: 'Ringkasan', icon: IconChartBar },
    ]

    // Render
    return (
        <PullToRefresh onRefresh={handleRefresh}>
            <div className="space-y-4 animate-in max-w-full overflow-x-hidden">{/* Mobile: Back button */}
            {!isDesktop && (
                <div className="flex items-center gap-2 -mb-2">
                    <button onClick={() => navigate('/more')} className="btn-icon" aria-label="Kembali">
                        <IconArrowLeft size={20} stroke={2} />
                    </button>
                </div>
            )}

            {/* Header with Net Worth */}
            <FinanceHeader
                netWorth={netWorth}
                monthIncome={summary.income}
                monthExpense={summary.expense}
                syncState="synced"
            />

            {/* Main Tab Selector */}
            <div className="overflow-x-auto max-w-full" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                <div className="flex gap-1 bg-paper-warm p-1 rounded-xl w-max min-w-full">
                    {mainTabs.map(tab => {
                        const Icon = tab.icon
                        const isActive = mainTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setMainTab(tab.id)}
                                className={`
                                    flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
                                    text-small font-medium transition-all whitespace-nowrap
                                    ${isActive
                                        ? 'bg-surface text-primary shadow-sm'
                                        : 'text-ink-muted hover:text-ink'
                                    }
                                `}
                            >
                                <Icon size={16} stroke={2} />
                                <span className="hidden xs:inline">{tab.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Tab Content */}
            {mainTab === 'budget' ? (
                <BudgetPanel />
            ) : mainTab === 'bills' ? (
                <BillsPanel />
            ) : mainTab === 'recurring' ? (
                <RecurringManager />
            ) : mainTab === 'insights' ? (
                <InsightsPanel transactions={transactions} accounts={accounts} />
            ) : (
                <>
                    {/* Desktop: 2-pane layout */}
                    {isDesktop ? (
                        <div className="flex gap-6">
                            {/* Left: Accounts panel (280px) */}
                            <div className="w-[280px] shrink-0 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-h2 text-ink">Dompet</h2>
                                    <button
                                        onClick={() => setShowAddAccount(true)}
                                        className="btn-ghost btn-sm"
                                    >
                                        <IconPlus size={16} stroke={2} />
                                    </button>
                                </div>

                                {accounts.length > 0 ? (
                                    <div className="space-y-2">
                                        {/* All accounts option */}
                                        <button
                                            onClick={() => setSelectedAccountId(null)}
                                            className={`w-full text-left p-3 rounded-lg transition-all border ${!selectedAccountId
                                                ? 'bg-primary-50 border-primary text-primary'
                                                : 'bg-paper-warm border-transparent text-ink-muted hover:bg-paper-cream'
                                                }`}
                                        >
                                            Semua transaksi
                                        </button>

                                        {accounts.map(account => (
                                            <AccountCard
                                                key={account.id}
                                                id={account.id}
                                                name={account.name}
                                                type={account.type}
                                                provider={account.provider}
                                                balance={account.balance_cached}
                                                isActive={selectedAccountId === account.id}
                                                onClick={(id) => setSelectedAccountId(selectedAccountId === id ? null : id)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-body text-ink-muted mb-4">{EMPTY_STATES.noAccounts.title}</p>
                                        <button onClick={() => setShowAddAccount(true)} className="btn-primary btn-sm">
                                            {EMPTY_STATES.noAccounts.primaryCta}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Right: Transactions panel (flex-1) */}
                            <div className="flex-1 space-y-4">
                                {/* Quick actions */}
                                <div className="flex gap-2">
                                    <button onClick={() => handleAddTransaction('expense')} className="btn-secondary">
                                        <IconMinus size={18} className="text-red-500" />
                                        <span>Keluar</span>
                                    </button>
                                    <button onClick={() => handleAddTransaction('income')} className="btn-secondary">
                                        <IconPlus size={18} className="text-green-500" />
                                        <span>Masuk</span>
                                    </button>
                                    <button onClick={() => handleAddTransaction('transfer')} className="btn-secondary">
                                        <IconArrowsExchange size={18} className="text-primary" />
                                        <span>Transfer</span>
                                    </button>
                                </div>

                                <TransactionsPanel
                                    transactions={displayedTransactions}
                                    accountsMap={accountsMap}
                                    activeTab={activeTab}
                                    onTabChange={setActiveTab}
                                    onTransactionDelete={handleTransactionDelete}
                                    onAddClick={() => handleAddTransaction('expense')}
                                />
                            </div>
                        </div>
                    ) : (
                        /* Mobile: Stacked layout */
                        <>
                            {/* Accounts carousel */}
                            <div className="overflow-x-auto -mx-4 px-4 max-w-[100vw]">
                                <div className="flex gap-2 pb-2 min-w-max">
                                    {accounts.map(account => (
                                        <AccountChip
                                            key={account.id}
                                            id={account.id}
                                            name={account.name}
                                            type={account.type}
                                            balance={account.balance_cached}
                                            isActive={selectedAccountId === account.id}
                                            onClick={(id) => setSelectedAccountId(selectedAccountId === id ? null : id)}
                                        />
                                    ))}
                                    <AddAccountChip onClick={() => setShowAddAccount(true)} />
                                </div>
                            </div>

                            {/* Quick actions - compact on mobile */}
                            <div className="grid grid-cols-3 gap-1 sm:gap-2">
                                <button
                                    onClick={() => handleAddTransaction('expense')}
                                    className="flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg border border-line bg-surface hover:bg-paper-warm transition-colors text-small"
                                >
                                    <IconMinus size={16} className="text-red-500 shrink-0" />
                                    <span className="truncate">Keluar</span>
                                </button>
                                <button
                                    onClick={() => handleAddTransaction('income')}
                                    className="flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg border border-line bg-surface hover:bg-paper-warm transition-colors text-small"
                                >
                                    <IconPlus size={16} className="text-green-500 shrink-0" />
                                    <span className="truncate">Masuk</span>
                                </button>
                                <button
                                    onClick={() => handleAddTransaction('transfer')}
                                    className="flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg border border-line bg-surface hover:bg-paper-warm transition-colors text-small"
                                >
                                    <IconArrowsExchange size={16} className="text-primary shrink-0" />
                                    <span className="truncate">Transfer</span>
                                </button>
                            </div>

                            {/* Transactions list */}
                            <TransactionsPanel
                                transactions={displayedTransactions}
                                accountsMap={accountsMap}
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                                onTransactionDelete={handleTransactionDelete}
                                onAddClick={() => handleAddTransaction('expense')}
                            />
                        </>
                    )}
                </>
            )}

            {/* Add Account Modal */}
            {showAddAccount && (
                <AddAccountModal
                    onClose={() => setShowAddAccount(false)}
                    onSuccess={handleAccountSuccess}
                />
            )}

            {/* Transaction Bottom Sheet */}
            <TxnSheet
                open={showTxnSheet}
                onClose={() => setShowTxnSheet(false)}
                defaultType={txnSheetType}
                accounts={accounts}
                categories={categories}
                onSubmit={handleTransactionSubmit}
            />
        </div>
        </PullToRefresh>
    )
}

export default FinancePage
