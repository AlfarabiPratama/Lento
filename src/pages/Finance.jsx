import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { IconArrowLeft, IconPlus, IconMinus, IconArrowsExchange, IconPigMoney, IconReceipt, IconChartBar, IconRepeat, IconDownload } from '@tabler/icons-react'
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
import { CategoryManager } from '../components/finance/organisms/CategoryManager'
import { ExportModal } from '../components/finance/organisms/ExportModal'
import { TemplateManager } from '../components/finance/organisms/TemplateManager'

// Molecules
import AccountCard from '../components/finance/molecules/AccountCard'
import AccountChip, { AddAccountChip } from '../components/finance/molecules/AccountChip'
import QuickStats from '../components/finance/molecules/QuickStats'
import DateFilter from '../components/finance/molecules/DateFilter'
import { TagFilter } from '../components/finance/molecules/TagFilter'

// Utils
import { filterTransactionsByDate } from '../utils/dateFilters'
import * as templateRepo from '../lib/transactionTemplates'

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
    const { transactions, create: createTransaction, update: updateTransaction, remove: removeTransaction, refresh: refreshTransactions } = useTransactions()
    const { summary, refresh: refreshSummary } = useCurrentMonthSummary()
    const { categories, customCategories, addCustom, removeCustom } = useFinanceCategories()

    // Templates state
    const [templates, setTemplates] = useState([])
    const [showTemplateManager, setShowTemplateManager] = useState(false)

    // Run recurring generator on mount
    useRecurringGenerator()

    // Load templates
    useEffect(() => {
        templateRepo.getTransactionTemplates().then(setTemplates)
    }, [])

    // UI state
    const [mainTab, setMainTab] = useState('transactions') // 'transactions' | 'budget'
    const [selectedAccountId, setSelectedAccountId] = useState(null)
    const [activeTab, setActiveTab] = useState('all')
    const [dateFilter, setDateFilter] = useState({ type: 'all' })
    const [tagFilter, setTagFilter] = useState(null)
    const [showAddAccount, setShowAddAccount] = useState(false)
    const [editingAccount, setEditingAccount] = useState(null)
    const [showTxnSheet, setShowTxnSheet] = useState(false)
    const [txnSheetType, setTxnSheetType] = useState('expense')
    const [editingTransaction, setEditingTransaction] = useState(null)
    const [showCategoryManager, setShowCategoryManager] = useState(false)
    const [showExportModal, setShowExportModal] = useState(false)
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

    // Filter transactions by selected account, date, and tags
    const displayedTransactions = useMemo(() => {
        let filtered = transactions
        if (selectedAccountId) {
            filtered = filtered.filter(
                t => t.account_id === selectedAccountId || t.to_account_id === selectedAccountId
            )
        }
        filtered = filterTransactionsByDate(filtered, dateFilter)
        if (tagFilter) {
            filtered = filtered.filter(t => t.tags && t.tags.includes(tagFilter))
        }
        return filtered
    }, [transactions, selectedAccountId, dateFilter, tagFilter])

    // Handlers
    const handleAddTransaction = (type) => {
        haptics.light()
        setEditingTransaction(null)
        setTxnSheetType(type)
        setShowTxnSheet(true)
    }

    const handleTransactionClick = (id) => {
        const transaction = transactions.find(t => t.id === id)
        if (transaction) {
            haptics.light()
            setEditingTransaction(transaction)
            setTxnSheetType(transaction.type)
            setShowTxnSheet(true)
        }
    }

    const handleTransactionDuplicate = async (transactionData) => {
        // Create new transaction with same data (without id and timestamp)
        haptics.light()
        setEditingTransaction(null)
        setTxnSheetType(transactionData.type)
        
        // Pre-fill form with duplicated data
        setTimeout(() => {
            setEditingTransaction({
                ...transactionData,
                id: null, // Remove ID so it's treated as new
                date: new Date().toISOString(), // Use current date
            })
            setShowTxnSheet(true)
        }, 100)
    }

    const handleUseTemplate = () => {
        haptics.light()
        setShowTemplateManager(true)
    }

    const handleTemplateSelect = (template) => {
        haptics.light()
        setEditingTransaction({
            type: template.type,
            amount: template.amount,
            category_id: template.category_id,
            account_id: template.account_id,
            to_account_id: template.to_account_id,
            payment_method: template.payment_method,
            merchant: template.merchant,
            note: template.note,
            tags: template.tags || [],
            date: new Date().toISOString(),
        })
        setTxnSheetType(template.type)
        setShowTxnSheet(true)
    }

    const handleSaveAsTemplate = async (templateData) => {
        try {
            await templateRepo.createTransactionTemplate(templateData)
            const updated = await templateRepo.getTransactionTemplates()
            setTemplates(updated)
            haptics.success()
        } catch (error) {
            console.error('Failed to save template:', error)
            haptics.error()
        }
    }

    const handleTransactionSubmit = async (data) => {
        if (editingTransaction?.id) {
            // Update existing transaction
            await updateTransaction(editingTransaction.id, data)
        } else {
            // Create new transaction
            await createTransaction(data)
        }
        await Promise.all([refreshAccounts(), refreshTransactions(), refreshSummary()])
        setEditingTransaction(null)
    }

    const handleTransactionDelete = async (id) => {
        // Konfirmasi sebelum menghapus
        const confirmed = window.confirm('Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.')
        
        if (!confirmed) {
            return // User membatalkan
        }

        try {
            await removeTransaction(id)
            await Promise.all([refreshAccounts(), refreshTransactions(), refreshSummary()])
            haptics.success()
        } catch (err) {
            haptics.error()
        }
    }

    const handleCloseSheet = () => {
        setShowTxnSheet(false)
        setEditingTransaction(null)
    }

    const handleAccountSuccess = () => {
        setShowAddAccount(false)
        setEditingAccount(null)
        refreshAccounts()
    }

    const handleAccountClick = (id) => {
        setSelectedAccountId(selectedAccountId === id ? null : id)
    }

    const handleAccountEdit = (account) => {
        haptics.light()
        setEditingAccount(account)
        setShowAddAccount(true)
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
        <>
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
                                                onClick={handleAccountClick}
                                                onEdit={handleAccountEdit}
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
                                {/* Quick Stats */}
                                <QuickStats transactions={transactions} accounts={accounts} />
                                
                                {/* Quick actions */}
                                <div className="flex gap-2">
                                    <button onClick={() => handleAddTransaction('expense')} className="btn-secondary" aria-label="Tambah pengeluaran">
                                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 dark:bg-red-950/30">
                                            <IconMinus size={14} className="text-red-600 dark:text-red-400" stroke={2.5} />
                                        </div>
                                        <span>Keluar</span>
                                    </button>
                                    <button onClick={() => handleAddTransaction('income')} className="btn-secondary" aria-label="Tambah pemasukan">
                                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 dark:bg-green-950/30">
                                            <IconPlus size={14} className="text-green-600 dark:text-green-400" stroke={2.5} />
                                        </div>
                                        <span>Masuk</span>
                                    </button>
                                    <button onClick={() => handleAddTransaction('transfer')} className="btn-secondary" aria-label="Tambah transfer">
                                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10">
                                            <IconArrowsExchange size={14} className="text-primary" stroke={2.5} />
                                        </div>
                                        <span>Transfer</span>
                                    </button>
                                </div>

                                {/* Date Filter */}
                                <DateFilter value={dateFilter} onChange={setDateFilter} />

                                {/* Tag Filter */}
                                <TagFilter allTransactions={transactions} value={tagFilter} onChange={setTagFilter} />

                                {/* Export Button */}
                                <button
                                    onClick={() => setShowExportModal(true)}
                                    className="btn-secondary w-full"
                                >
                                    <IconDownload size={18} />
                                    <span>Export ke CSV</span>
                                </button>

                                <TransactionsPanel
                                    transactions={displayedTransactions}
                                    accountsMap={accountsMap}
                                    activeTab={activeTab}
                                    onTabChange={setActiveTab}
                                    onTransactionClick={handleTransactionClick}
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
                                            provider={account.provider}
                                            balance={account.balance_cached}
                                            isActive={selectedAccountId === account.id}
                                            onClick={(id) => setSelectedAccountId(selectedAccountId === id ? null : id)}
                                            onEdit={handleAccountEdit}
                                        />
                                    ))}
                                    <AddAccountChip onClick={() => setShowAddAccount(true)} />
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <QuickStats transactions={transactions} accounts={accounts} />

                            {/* Quick actions - compact on mobile */}
                            <div className="grid grid-cols-3 gap-1 sm:gap-2">
                                <button
                                    onClick={() => handleAddTransaction('expense')}
                                    className="flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg border border-line bg-surface hover:bg-paper-warm transition-colors text-small min-h-[44px]"
                                    aria-label="Tambah pengeluaran"
                                >
                                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 dark:bg-red-950/30 shrink-0">
                                        <IconMinus size={12} className="text-red-600 dark:text-red-400" stroke={2.5} />
                                    </div>
                                    <span className="truncate">Keluar</span>
                                </button>
                                <button
                                    onClick={() => handleAddTransaction('income')}
                                    className="flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg border border-line bg-surface hover:bg-paper-warm transition-colors text-small min-h-[44px]"
                                    aria-label="Tambah pemasukan"
                                >
                                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 dark:bg-green-950/30 shrink-0">
                                        <IconPlus size={12} className="text-green-600 dark:text-green-400" stroke={2.5} />
                                    </div>
                                    <span className="truncate">Masuk</span>
                                </button>
                                <button
                                    onClick={() => handleAddTransaction('transfer')}
                                    className="flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg border border-line bg-surface hover:bg-paper-warm transition-colors text-small min-h-[44px]"
                                    aria-label="Tambah transfer"
                                >
                                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 shrink-0">
                                        <IconArrowsExchange size={12} className="text-primary" stroke={2.5} />
                                    </div>
                                    <span className="truncate">Transfer</span>
                                </button>
                            </div>

                            {/* Date Filter */}
                            <DateFilter value={dateFilter} onChange={setDateFilter} />

                            {/* Tag Filter */}
                            <TagFilter allTransactions={transactions} value={tagFilter} onChange={setTagFilter} />

                            {/* Export Button */}
                            <button
                                onClick={() => setShowExportModal(true)}
                                className="btn-secondary w-full"
                            >
                                <IconDownload size={18} />
                                <span>Export ke CSV</span>
                            </button>

                            {/* Transactions list */}
                            <TransactionsPanel
                                transactions={displayedTransactions}
                                accountsMap={accountsMap}
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                                onTransactionClick={handleTransactionClick}
                                onTransactionDelete={handleTransactionDelete}
                                onAddClick={() => handleAddTransaction('expense')}
                            />
                        </>
                    )}
                </>
            )}
        </div>
        </PullToRefresh>

        {/* Add Account Modal - Outside PullToRefresh for proper overlay */}
        {showAddAccount && (
            <AddAccountModal
                mode={editingAccount ? 'edit' : 'create'}
                initialData={editingAccount || {}}
                onClose={() => {
                    setShowAddAccount(false)
                    setEditingAccount(null)
                }}
                onSuccess={handleAccountSuccess}
            />
        )}

        {/* Transaction Bottom Sheet - Outside PullToRefresh for full-screen overlay */}
        <TxnSheet
            open={showTxnSheet}
            onClose={handleCloseSheet}
            mode={editingTransaction?.id ? 'edit' : 'create'}
            defaultType={txnSheetType}
            initialData={editingTransaction || {}}
            accounts={accounts}
            categories={categories}
            onSubmit={handleTransactionSubmit}
            onDelete={editingTransaction?.id ? () => handleTransactionDelete(editingTransaction.id) : undefined}
            onDuplicate={editingTransaction?.id ? () => handleTransactionDuplicate(editingTransaction) : undefined}
            onManageCategories={() => setShowCategoryManager(true)}
            onUseTemplate={handleUseTemplate}
            onSaveAsTemplate={handleSaveAsTemplate}
        />

        {/* Category Manager Modal */}
        {showCategoryManager && (
            <CategoryManager
                customCategories={customCategories}
                onAdd={addCustom}
                onRemove={removeCustom}
                onClose={() => setShowCategoryManager(false)}
            />
        )}

        {/* Export Modal */}
        {showExportModal && (
            <ExportModal
                transactions={transactions}
                accounts={accounts}
                onClose={() => setShowExportModal(false)}
            />
        )}

        {/* Template Manager Modal */}
        {showTemplateManager && (
            <TemplateManager
                templates={templates}
                onUseTemplate={handleTemplateSelect}
                onClose={() => setShowTemplateManager(false)}
            />
        )}
        </>
    )
}

export default FinancePage
