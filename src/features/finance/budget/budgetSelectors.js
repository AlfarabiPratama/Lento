/**
 * Budget Selectors - Computed values for budget
 * @ts-check
 */

import { getDB } from '../../../lib/db'

/**
 * Get spent amount for a category in a month
 * @param {string} categoryId
 * @param {string} month - YYYY-MM
 * @returns {Promise<number>} Total spent (integer IDR)
 */
export async function getSpentByCategory(categoryId, month) {
    const db = await getDB()
    const allTxns = await db.getAll('transactions')

    // Filter: expense, matching category, matching month
    const spent = allTxns
        .filter(txn => {
            if (txn.type !== 'expense') return false
            if (txn.category_id !== categoryId) return false
            const txnMonth = txn.date?.substring(0, 7) // YYYY-MM
            return txnMonth === month
        })
        .reduce((sum, txn) => sum + (txn.amount || 0), 0)

    return spent
}

/**
 * Get budget progress for all categories in a month
 * @param {Object[]} budgetCategories - Array of budget category objects
 * @param {string} month - YYYY-MM
 * @returns {Promise<Object[]>} Categories with spent, remaining, progress, status
 */
export async function getBudgetProgress(budgetCategories, month) {
    const results = []

    for (const bc of budgetCategories) {
        const spent = await getSpentByCategory(bc.category_id, month)
        const budgeted = bc.amount_budgeted || 0
        const remaining = budgeted - spent
        const progress = budgeted > 0 ? Math.min(spent / budgeted, 1.5) : 0 // Cap at 150% for display

        // Status: ok, near (≥80%), over (>100%)
        let status = 'ok'
        if (budgeted > 0) {
            const percent = (spent / budgeted) * 100
            if (percent > 100) {
                status = 'over'
            } else if (percent >= 80) {
                status = 'near'
            }
        }

        results.push({
            ...bc,
            spent,
            remaining,
            progress,
            status,
        })
    }

    return results
}

/**
 * Get total budget summary for a month
 * @param {Object[]} budgetProgress - Array from getBudgetProgress
 * @returns {Object} { totalBudgeted, totalSpent, totalRemaining }
 */
export function getBudgetSummary(budgetProgress) {
    const totalBudgeted = budgetProgress.reduce((sum, bc) => sum + (bc.amount_budgeted || 0), 0)
    const totalSpent = budgetProgress.reduce((sum, bc) => sum + (bc.spent || 0), 0)
    const totalRemaining = totalBudgeted - totalSpent

    return {
        totalBudgeted,
        totalSpent,
        totalRemaining,
    }
}

/**
 * Filter categories by status
 * @param {Object[]} budgetProgress
 * @param {'all' | 'over' | 'near' | 'ok'} filter
 * @returns {Object[]}
 */
export function filterByStatus(budgetProgress, filter) {
    if (filter === 'all') return budgetProgress
    return budgetProgress.filter(bc => bc.status === filter)
}

export default {
    getSpentByCategory,
    getBudgetProgress,
    getBudgetSummary,
    filterByStatus,
}
