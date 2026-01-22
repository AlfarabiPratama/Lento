/**
 * Budget Repository - CRUD operations for budget data
 * @ts-check
 */

import { getDB, generateId, now } from '../../../lib/db'

/**
 * Get current month string (YYYY-MM)
 * @returns {string}
 */
export function getCurrentMonth() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Get previous month string (YYYY-MM)
 * @param {string} month
 * @returns {string}
 */
export function getPreviousMonth(month) {
    const [year, m] = month.split('-').map(Number)
    const prev = new Date(year, m - 2, 1) // m-1 is current, m-2 is previous
    return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`
}

// ==================== Budget Month ====================

/**
 * Get or create budget for a specific month
 * @param {string} month - YYYY-MM format
 * @returns {Promise<Object>}
 */
export async function getOrCreateBudgetMonth(month) {
    const db = await getDB()

    // Find existing
    const existing = await db.getFromIndex('budget_months', 'by_month', month)
    if (existing) return existing

    // Create new
    const newBudget = {
        id: generateId(),
        month,
        created_at: now(),
        updated_at: now(),
    }

    await db.put('budget_months', newBudget)
    return newBudget
}

/**
 * Get budget month by ID
 * @param {string} id
 */
export async function getBudgetMonth(id) {
    const db = await getDB()
    return db.get('budget_months', id)
}

/**
 * Get budget month by month string
 * @param {string} month - YYYY-MM
 */
export async function getBudgetMonthByMonth(month) {
    const db = await getDB()
    return db.getFromIndex('budget_months', 'by_month', month)
}

// ==================== Budget Category ====================

/**
 * Get all budget categories for a month
 * @param {string} budgetMonthId
 * @returns {Promise<Object[]>}
 */
export async function getBudgetCategories(budgetMonthId) {
    const db = await getDB()
    return db.getAllFromIndex('budget_categories', 'by_budget_month', budgetMonthId)
}

/**
 * Set budget for a category
 * @param {string} budgetMonthId
 * @param {string} categoryId
 * @param {number} amount - Integer IDR
 */
export async function setBudgetCategory(budgetMonthId, categoryId, amount) {
    const db = await getDB()

    // Find existing
    const all = await db.getAllFromIndex('budget_categories', 'by_budget_month', budgetMonthId)
    const existing = all.find(bc => bc.category_id === categoryId)

    if (existing) {
        // Update
        existing.amount_budgeted = amount
        existing.updated_at = now()
        await db.put('budget_categories', existing)
        return existing
    } else {
        // Create
        const newBudgetCat = {
            id: generateId(),
            budget_month_id: budgetMonthId,
            category_id: categoryId,
            amount_budgeted: amount,
            created_at: now(),
            updated_at: now(),
        }
        await db.put('budget_categories', newBudgetCat)
        return newBudgetCat
    }
}

/**
 * Delete budget category
 * @param {string} id
 */
export async function deleteBudgetCategory(id) {
    const db = await getDB()
    await db.delete('budget_categories', id)
}

/**
 * Copy budget from previous month
 * @param {string} targetMonth - YYYY-MM
 * @returns {Promise<{success: boolean, count: number}>}
 */
export async function copyFromPreviousMonth(targetMonth) {
    const prevMonth = getPreviousMonth(targetMonth)

    // Get previous month budget
    const prevBudgetMonth = await getBudgetMonthByMonth(prevMonth)
    if (!prevBudgetMonth) {
        return { success: false, count: 0 }
    }

    // Get previous categories
    const prevCategories = await getBudgetCategories(prevBudgetMonth.id)
    if (prevCategories.length === 0) {
        return { success: false, count: 0 }
    }

    // Get or create target month
    const targetBudgetMonth = await getOrCreateBudgetMonth(targetMonth)

    // Copy categories
    for (const prevCat of prevCategories) {
        await setBudgetCategory(
            targetBudgetMonth.id,
            prevCat.category_id,
            prevCat.amount_budgeted
        )
    }

    return { success: true, count: prevCategories.length }
}

export default {
    getCurrentMonth,
    getPreviousMonth,
    getOrCreateBudgetMonth,
    getBudgetMonth,
    getBudgetMonthByMonth,
    getBudgetCategories,
    setBudgetCategory,
    deleteBudgetCategory,
    copyFromPreviousMonth,
}
