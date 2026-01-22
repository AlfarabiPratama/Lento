import { useState, useEffect, useCallback } from 'react'
import * as finance from '../lib/finance'

/**
 * Hook for accounts (dompet)
 */
export function useAccounts() {
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        const data = await finance.getAccounts()
        setAccounts(data)
        setLoading(false)
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const create = useCallback(async (data) => {
        const account = await finance.createAccount(data)
        await refresh()
        return account
    }, [refresh])

    const update = useCallback(async (id, updates) => {
        const account = await finance.updateAccount(id, updates)
        await refresh()
        return account
    }, [refresh])

    const remove = useCallback(async (id) => {
        await finance.deleteAccount(id)
        await refresh()
    }, [refresh])

    // Calculate total net worth from accounts
    const netWorth = accounts.reduce((sum, a) => sum + (a.balance_cached || 0), 0)

    return { accounts, loading, refresh, create, update, remove, netWorth }
}

/**
 * Hook for single account with transactions
 */
export function useAccount(accountId) {
    const [account, setAccount] = useState(null)
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        if (!accountId) {
            setAccount(null)
            setTransactions([])
            setLoading(false)
            return
        }

        const [acc, txs] = await Promise.all([
            finance.getAccount(accountId),
            finance.getTransactionsByAccount(accountId),
        ])
        setAccount(acc)
        setTransactions(txs)
        setLoading(false)
    }, [accountId])

    useEffect(() => {
        refresh()
    }, [refresh])

    return { account, transactions, loading, refresh }
}

/**
 * Hook for transactions
 */
export function useTransactions() {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        const data = await finance.getTransactions()
        setTransactions(data)
        setLoading(false)
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const create = useCallback(async (data) => {
        const tx = await finance.createTransaction(data)
        await refresh()
        return tx
    }, [refresh])

    const update = useCallback(async (id, updates) => {
        const tx = await finance.updateTransaction(id, updates)
        await refresh()
        return tx
    }, [refresh])

    const remove = useCallback(async (id) => {
        await finance.deleteTransaction(id)
        await refresh()
    }, [refresh])

    return { transactions, loading, refresh, create, update, remove }
}

/**
 * Hook for monthly summary
 */
export function useMonthlySummary(year, month) {
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0, count: 0 })
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        const data = await finance.getMonthlySummary(year, month)
        setSummary(data)
        setLoading(false)
    }, [year, month])

    useEffect(() => {
        refresh()
    }, [refresh])

    return { summary, loading, refresh }
}

/**
 * Hook for current month summary
 */
export function useCurrentMonthSummary() {
    const now = new Date()
    return useMonthlySummary(now.getFullYear(), now.getMonth())
}

/**
 * Hook for finance categories
 */
export function useFinanceCategories() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const init = async () => {
            await finance.initCategories()
            const cats = await finance.getCategories()
            setCategories(cats)
            setLoading(false)
        }
        init()
    }, [])

    const byType = useCallback((type) => {
        return categories.filter(c => c.type === type)
    }, [categories])

    return { categories, loading, byType }
}

/**
 * Hook for category breakdown
 */
export function useCategoryBreakdown(year, month, type = 'expense') {
    const [breakdown, setBreakdown] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        finance.getCategoryBreakdown(year, month, type).then(data => {
            setBreakdown(data)
            setLoading(false)
        })
    }, [year, month, type])

    return { breakdown, loading }
}

/**
 * Hook for today's finance widget
 */
export function useTodayFinance() {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        const data = await finance.getTodayTransactions()
        setTransactions(data)
        setLoading(false)
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const todayIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

    const todayExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

    return {
        transactions,
        loading,
        refresh,
        todayIncome,
        todayExpense,
        todayNet: todayIncome - todayExpense,
    }
}

/**
 * Hook for combined finance state (accounts + summary)
 * For the main Finance page
 */
export function useFinanceOverview() {
    const { accounts, netWorth, loading: accountsLoading, refresh: refreshAccounts } = useAccounts()
    const { summary, loading: summaryLoading, refresh: refreshSummary } = useCurrentMonthSummary()

    const refresh = useCallback(async () => {
        await Promise.all([refreshAccounts(), refreshSummary()])
    }, [refreshAccounts, refreshSummary])

    return {
        accounts,
        netWorth,
        summary,
        loading: accountsLoading || summaryLoading,
        refresh,
    }
}

// Re-export utilities
export { formatCurrency, formatCurrencyCompact } from '../lib/finance'
export { ACCOUNT_TYPES, EWALLET_PROVIDERS, PAYMENT_METHODS } from '../lib/finance'
