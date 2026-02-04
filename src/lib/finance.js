import { getDB, generateId, now, today, createBaseFields, markDeleted, markUpdated } from './db'
import { addToOutbox } from './outbox'

/**
 * Lento Finance Service v2
 * 
 * Konsep: Account → Transaction → Insight
 * Saldo = delta-based (real-time, tidak hitung ulang dari nol)
 */

// ===== DEFAULT DATA =====

export const ACCOUNT_TYPES = {
    cash: { label: 'Cash', icon: '💵' },
    bank: { label: 'Bank', icon: '🏦' },
    ewallet: { label: 'E-Wallet', icon: '📱' },
}

export const EWALLET_PROVIDERS = [
    { id: 'gopay', name: 'GoPay', icon: '🟢' },
    { id: 'dana', name: 'DANA', icon: '🔵' },
    { id: 'ovo', name: 'OVO', icon: '🟣' },
    { id: 'shopeepay', name: 'ShopeePay', icon: '🟠' },
    { id: 'linkaja', name: 'LinkAja', icon: '🔴' },
    { id: 'other', name: 'Lainnya', icon: '📱' },
]

export const DEFAULT_CATEGORIES = {
    income: [
        { name: 'Uang saku', icon: '💰' },
        { name: 'Beasiswa', icon: '🎓' },
        { name: 'Gaji/Freelance', icon: '💼' },
        { name: 'Hadiah', icon: '🎁' },
        { name: 'Refund', icon: '↩️' },
    ],
    expense: [
        { name: 'Makan & jajan', icon: '🍽️' },
        { name: 'Transport', icon: '🚗' },
        { name: 'Kos/kontrakan', icon: '🏠' },
        { name: 'Pulsa & data', icon: '📶' },
        { name: 'Kuliah', icon: '📚' },
        { name: 'Nongkrong', icon: '☕' },
        { name: 'Langganan', icon: '📺' },
        { name: 'Kesehatan', icon: '💊' },
        { name: 'Donasi', icon: '❤️' },
        { name: 'Lainnya', icon: '📦' },
    ],
}

export const PAYMENT_METHODS = [
    { id: 'cash', label: 'Cash' },
    { id: 'qris', label: 'QRIS' },
    { id: 'transfer', label: 'Transfer' },
    { id: 'debit', label: 'Debit' },
    { id: 'credit', label: 'Credit' },
    { id: 'ewallet', label: 'E-Wallet' },
]

// ===== ACCOUNTS (DOMPET) =====

/**
 * Get all accounts
 */
export async function getAccounts() {
    const db = await getDB()
    const accounts = await db.getAll('accounts')
    return accounts.filter(a => !a.deleted_at).sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Get single account
 */
export async function getAccount(id) {
    const db = await getDB()
    return db.get('accounts', id)
}

/**
 * Create new account
 */
export async function createAccount({
    name,
    type, // cash | bank | ewallet
    provider = '',
    opening_balance = 0,
    currency = 'IDR',
}) {
    const db = await getDB()

    const account = {
        ...createBaseFields(),
        name,
        type,
        provider,
        currency,
        opening_balance,
        balance_cached: opening_balance, // Start with opening balance
    }

    await db.add('accounts', account)
    await addToOutbox('accounts', 'create', account)

    return account
}

/**
 * Update account (name, provider, opening_balance, etc)
 * If opening_balance changes, recalculate balance_cached from all transactions
 */
export async function updateAccount(id, updates) {
    const db = await getDB()
    const account = await db.get('accounts', id)
    if (!account) return null

    // Check if opening_balance is being updated
    const openingBalanceChanged = updates.opening_balance !== undefined && 
                                   updates.opening_balance !== account.opening_balance

    let newBalanceCached = account.balance_cached

    // Recalculate balance if opening_balance changed
    if (openingBalanceChanged) {
        // Get all transactions for this account
        const allTxs = await db.getAll('transactions')
        const accountTxs = allTxs.filter(t => 
            !t.deleted_at && 
            (t.account_id === id || t.to_account_id === id)
        )

        // Calculate delta from all transactions
        let transactionsDelta = 0
        for (const tx of accountTxs) {
            if (tx.account_id === id) {
                // This account is source
                if (tx.type === 'income') {
                    transactionsDelta += tx.amount
                } else if (tx.type === 'expense') {
                    transactionsDelta -= tx.amount
                } else if (tx.type === 'transfer') {
                    transactionsDelta -= tx.amount // outgoing
                }
            }
            if (tx.to_account_id === id) {
                // This account is destination (transfer only)
                transactionsDelta += tx.amount // incoming
            }
        }

        // New balance = new opening balance + all transaction deltas
        newBalanceCached = updates.opening_balance + transactionsDelta
    }

    const updated = markUpdated({
        ...account,
        ...updates,
        balance_cached: newBalanceCached,
    })

    await db.put('accounts', updated)
    await addToOutbox('accounts', 'update', updated)

    return updated
}

/**
 * Delete account (soft delete)
 */
export async function deleteAccount(id) {
    const db = await getDB()
    const account = await db.get('accounts', id)
    if (!account) return

    const deleted = markDeleted(account)
    await db.put('accounts', deleted)
    await addToOutbox('accounts', 'delete', deleted)
}

/**
 * Calculate total Net Worth
 */
export async function getNetWorth() {
    const accounts = await getAccounts()
    return accounts.reduce((sum, a) => sum + (a.balance_cached || 0), 0)
}

// ===== CATEGORIES =====

/**
 * Initialize default categories
 */
export async function initCategories() {
    const db = await getDB()
    const existing = await db.getAll('finance_categories')

    if (existing.length === 0) {
        for (const type of ['expense', 'income']) {
            for (const cat of DEFAULT_CATEGORIES[type]) {
                await db.add('finance_categories', {
                    ...createBaseFields(),
                    type,
                    ...cat,
                })
            }
        }
    }
}

/**
 * Get all categories
 */
export async function getCategories() {
    const db = await getDB()
    const cats = await db.getAll('finance_categories')
    return cats.filter(c => !c.deleted_at)
}

/**
 * Get categories by type
 */
export async function getCategoriesByType(type) {
    const cats = await getCategories()
    return cats.filter(c => c.type === type)
}

/**
 * Create custom category
 */
export async function createCustomCategory({ name, icon, type }) {
    const db = await getDB()
    const newCat = {
        ...createBaseFields(),
        name,
        icon,
        type,
        custom: true,
    }
    const id = await db.add('finance_categories', newCat)
    return { ...newCat, id }
}

/**
 * Delete custom category (only custom ones)
 */
export async function deleteCustomCategory(id) {
    const db = await getDB()
    const cat = await db.get('finance_categories', id)
    if (!cat || !cat.custom) {
        throw new Error('Can only delete custom categories')
    }
    await db.put('finance_categories', {
        ...cat,
        deleted_at: new Date().toISOString(),
    })
}

// ===== TRANSACTIONS =====

/**
 * Get all transactions (sorted by date desc)
 */
export async function getTransactions() {
    const db = await getDB()
    const txs = await db.getAll('transactions')
    return txs
        .filter(t => !t.deleted_at)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
}

/**
 * Get transactions by account
 */
export async function getTransactionsByAccount(accountId) {
    const db = await getDB()
    const txs = await db.getAll('transactions')
    return txs
        .filter(t => !t.deleted_at && (t.account_id === accountId || t.to_account_id === accountId))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
}

/**
 * Get transactions for a month
 */
export async function getTransactionsByMonth(year, month) {
    const txs = await getTransactions()
    return txs.filter(t => {
        const d = new Date(t.date)
        return d.getFullYear() === year && d.getMonth() === month
    })
}

// ===== DELTA-BASED BALANCE ENGINE =====

/**
 * Apply transaction effect to account balance
 * @private
 */
async function applyTransactionEffect(db, tx, multiplier = 1) {
    // multiplier: 1 = apply, -1 = rollback

    if (tx.type === 'income') {
        const account = await db.get('accounts', tx.account_id)
        if (account) {
            account.balance_cached += tx.amount * multiplier
            account.updated_at = now()
            await db.put('accounts', account)
        }
    }
    else if (tx.type === 'expense') {
        const account = await db.get('accounts', tx.account_id)
        if (account) {
            account.balance_cached -= tx.amount * multiplier
            account.updated_at = now()
            await db.put('accounts', account)
        }
    }
    else if (tx.type === 'transfer') {
        // From account: decrease
        const fromAccount = await db.get('accounts', tx.account_id)
        if (fromAccount) {
            fromAccount.balance_cached -= tx.amount * multiplier
            fromAccount.updated_at = now()
            await db.put('accounts', fromAccount)
        }
        // To account: increase
        const toAccount = await db.get('accounts', tx.to_account_id)
        if (toAccount) {
            toAccount.balance_cached += tx.amount * multiplier
            toAccount.updated_at = now()
            await db.put('accounts', toAccount)
        }
    }
}

/**
 * Create new transaction (ATOMIC: tx + balance update)
 */
export async function createTransaction({
    type, // income | expense | transfer
    amount,
    account_id,
    to_account_id = null,
    category_id = null,
    date = today(),
    note = '',
    payment_method = null,
    merchant = null,
    tags = [],
}) {
    const db = await getDB()

    // Validation
    if (type === 'transfer' && (!to_account_id || account_id === to_account_id)) {
        throw new Error('Transfer harus ke akun yang berbeda')
    }

    const tx = {
        ...createBaseFields(),
        type,
        amount: Math.abs(amount),
        account_id,
        to_account_id: type === 'transfer' ? to_account_id : null,
        category_id,
        date,
        note,
        payment_method,
        merchant,
        tags,
    }

    // Atomic operation using IndexedDB transaction
    const idbTx = db.transaction(['transactions', 'accounts'], 'readwrite')

    try {
        await idbTx.objectStore('transactions').add(tx)
        await applyTransactionEffect({
            get: (store, id) => idbTx.objectStore(store).get(id),
            put: (store, data) => idbTx.objectStore(store).put(data),
        }, tx, 1)
        await idbTx.done
    } catch (error) {
        console.error('Create transaction failed:', error)
        throw error
    }

    await addToOutbox('transactions', 'create', tx)

    return tx
}

/**
 * Delete transaction (ATOMIC: rollback balance + delete tx)
 */
export async function deleteTransaction(id) {
    const db = await getDB()
    const tx = await db.get('transactions', id)
    if (!tx) return

    // Atomic rollback
    const idbTx = db.transaction(['transactions', 'accounts'], 'readwrite')

    try {
        // Rollback balance first
        await applyTransactionEffect({
            get: (store, id) => idbTx.objectStore(store).get(id),
            put: (store, data) => idbTx.objectStore(store).put(data),
        }, tx, -1)

        // Then soft delete
        const deleted = markDeleted(tx)
        await idbTx.objectStore('transactions').put(deleted)
        await idbTx.done
    } catch (error) {
        console.error('Delete transaction failed:', error)
        throw error
    }

    await addToOutbox('transactions', 'delete', tx)
}

/**
 * Update transaction (ATOMIC: rollback old + apply new)
 */
export async function updateTransaction(id, updates) {
    const db = await getDB()
    const oldTx = await db.get('transactions', id)
    if (!oldTx) return null

    const newTx = markUpdated({
        ...oldTx,
        ...updates,
        amount: updates.amount ? Math.abs(updates.amount) : oldTx.amount,
    })

    // Validation for transfer
    if (newTx.type === 'transfer' && (!newTx.to_account_id || newTx.account_id === newTx.to_account_id)) {
        throw new Error('Transfer harus ke akun yang berbeda')
    }

    // Atomic: rollback old, apply new
    const idbTx = db.transaction(['transactions', 'accounts'], 'readwrite')

    try {
        const dbProxy = {
            get: (store, id) => idbTx.objectStore(store).get(id),
            put: (store, data) => idbTx.objectStore(store).put(data),
        }

        // Rollback old effect
        await applyTransactionEffect(dbProxy, oldTx, -1)
        // Apply new effect
        await applyTransactionEffect(dbProxy, newTx, 1)
        // Save updated transaction
        await idbTx.objectStore('transactions').put(newTx)
        await idbTx.done
    } catch (error) {
        console.error('Update transaction failed:', error)
        throw error
    }

    await addToOutbox('transactions', 'update', newTx)

    return newTx
}

// ===== INSIGHTS =====

/**
 * Get monthly summary
 */
export async function getMonthlySummary(year = new Date().getFullYear(), month = new Date().getMonth()) {
    const txs = await getTransactionsByMonth(year, month)

    const income = txs
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

    const expense = txs
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

    return {
        income,
        expense,
        balance: income - expense,
        count: txs.length,
    }
}

/**
 * Get category breakdown for month
 */
export async function getCategoryBreakdown(year, month, type = 'expense') {
    const txs = await getTransactionsByMonth(year, month)
    const cats = await getCategories()

    const filtered = txs.filter(t => t.type === type)

    const breakdown = {}
    for (const tx of filtered) {
        const cat = cats.find(c => c.id === tx.category_id)
        const catName = cat?.name || 'Lainnya'
        const catIcon = cat?.icon || '📦'
        breakdown[catName] = {
            amount: (breakdown[catName]?.amount || 0) + tx.amount,
            icon: catIcon,
        }
    }

    return Object.entries(breakdown)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.amount - a.amount)
}

/**
 * Get today's transactions
 */
export async function getTodayTransactions() {
    const txs = await getTransactions()
    const todayStr = today()
    return txs.filter(t => t.date === todayStr)
}

// ===== UTILITIES =====

/**
 * Format currency (IDR)
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

/**
 * Format currency compact
 */
export function formatCurrencyCompact(amount) {
    if (Math.abs(amount) >= 1000000) {
        return `Rp${(amount / 1000000).toFixed(1)}jt`
    }
    if (Math.abs(amount) >= 1000) {
        return `Rp${(amount / 1000).toFixed(0)}rb`
    }
    return `Rp${amount}`
}
