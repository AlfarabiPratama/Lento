// @ts-check

/**
 * Lento Finance - Insight Layer
 * 
 * Aggregation functions for summary & breakdown
 */

/**
 * @typedef {import('./domain/applyDelta').Txn} Txn
 * @typedef {import('./domain/applyDelta').Account} Account
 */

/**
 * Compute monthly summary from transactions
 * @param {Txn[]} transactions 
 * @param {number} year 
 * @param {number} month - 0-indexed (0 = January)
 * @returns {{ income: number, expense: number, balance: number, count: number }}
 */
export function computeMonthSummary(transactions, year, month) {
    const filtered = transactions.filter(txn => {
        if (!txn.date) return false
        const d = new Date(txn.date)
        return d.getFullYear() === year && d.getMonth() === month
    })

    let income = 0
    let expense = 0

    for (const txn of filtered) {
        if (txn.type === 'income') {
            income += txn.amount
        } else if (txn.type === 'expense') {
            expense += txn.amount
        }
        // transfer doesn't affect monthly flow (internal movement)
    }

    return {
        income,
        expense,
        balance: income - expense,
        count: filtered.length,
    }
}

/**
 * Compute category breakdown for a month
 * @param {Array<Txn & { category_name?: string, category_icon?: string }>} transactions 
 * @param {number} year 
 * @param {number} month 
 * @param {'income' | 'expense'} type 
 * @returns {Array<{ name: string, icon: string, amount: number, percentage: number }>}
 */
export function computeCategoryBreakdown(transactions, year, month, type) {
    const filtered = transactions.filter(txn => {
        if (!txn.date || txn.type !== type) return false
        const d = new Date(txn.date)
        return d.getFullYear() === year && d.getMonth() === month
    })

    /** @type {Record<string, { amount: number, icon: string }>} */
    const byCategory = {}
    let total = 0

    for (const txn of filtered) {
        const name = txn.category_name || 'Lainnya'
        const icon = txn.category_icon || '📦'

        if (!byCategory[name]) {
            byCategory[name] = { amount: 0, icon }
        }
        byCategory[name].amount += txn.amount
        total += txn.amount
    }

    return Object.entries(byCategory)
        .map(([name, data]) => ({
            name,
            icon: data.icon,
            amount: data.amount,
            percentage: total > 0 ? (data.amount / total) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount)
}

/**
 * Compute total net worth from accounts
 * @param {Account[]} accounts 
 * @returns {number}
 */
export function computeNetWorth(accounts) {
    return accounts.reduce((sum, acc) => sum + (acc.balance_cached || 0), 0)
}

/**
 * Compute balance by account type
 * @param {Account[]} accounts 
 * @returns {{ cash: number, bank: number, ewallet: number }}
 */
export function computeBalanceByType(accounts) {
    const result = { cash: 0, bank: 0, ewallet: 0 }

    for (const acc of accounts) {
        if (acc.type in result) {
            result[acc.type] += acc.balance_cached || 0
        }
    }

    return result
}

/**
 * Get top categories for a period
 * @param {Array<Txn & { category_name?: string }>} transactions 
 * @param {'income' | 'expense'} type 
 * @param {number} [limit=5]
 * @returns {Array<{ name: string, amount: number }>}
 */
export function getTopCategories(transactions, type, limit = 5) {
    /** @type {Record<string, number>} */
    const byCategory = {}

    for (const txn of transactions) {
        if (txn.type !== type) continue
        const name = txn.category_name || 'Lainnya'
        byCategory[name] = (byCategory[name] || 0) + txn.amount
    }

    return Object.entries(byCategory)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, limit)
}
