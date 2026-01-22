import { useState, useEffect, useCallback } from 'react'
import {
    getCurrentMonth,
    getOrCreateBudgetMonth,
    getBudgetCategories,
    setBudgetCategory,
    deleteBudgetCategory,
    copyFromPreviousMonth,
} from '../features/finance/budget/budgetRepo'
import { getBudgetProgress, getBudgetSummary, filterByStatus } from '../features/finance/budget/budgetSelectors'
import { MAHASISWA_CATEGORIES } from '../features/finance/budget/budgetTemplates'

/**
 * useBudget - Budget state and operations hook
 */
export function useBudget(month = null) {
    const [currentMonth, setCurrentMonth] = useState(month || getCurrentMonth())
    const [budgetMonth, setBudgetMonth] = useState(null)
    const [categories, setCategories] = useState([])
    const [progress, setProgress] = useState([])
    const [summary, setSummary] = useState({ totalBudgeted: 0, totalSpent: 0, totalRemaining: 0 })
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    // Load budget data
    const loadBudget = useCallback(async () => {
        setLoading(true)
        try {
            // Get or create budget month
            const bm = await getOrCreateBudgetMonth(currentMonth)
            setBudgetMonth(bm)

            // Get budget categories
            const cats = await getBudgetCategories(bm.id)
            setCategories(cats)

            // Calculate progress
            const prog = await getBudgetProgress(cats, currentMonth)
            setProgress(prog)

            // Calculate summary
            const sum = getBudgetSummary(prog)
            setSummary(sum)
        } catch (err) {
            console.error('Failed to load budget:', err)
        } finally {
            setLoading(false)
        }
    }, [currentMonth])

    // Load on mount and month change
    useEffect(() => {
        loadBudget()
    }, [loadBudget])

    // Set budget for a category
    const setBudget = useCallback(async (categoryId, amount) => {
        if (!budgetMonth) return
        await setBudgetCategory(budgetMonth.id, categoryId, amount)
        await loadBudget()
    }, [budgetMonth, loadBudget])

    // Delete budget category
    const removeBudget = useCallback(async (budgetCategoryId) => {
        await deleteBudgetCategory(budgetCategoryId)
        await loadBudget()
    }, [loadBudget])

    // Copy from previous month
    const copyPrevious = useCallback(async () => {
        const result = await copyFromPreviousMonth(currentMonth)
        if (result.success) {
            await loadBudget()
        }
        return result
    }, [currentMonth, loadBudget])

    // Apply mahasiswa template
    const applyMahasiswaTemplate = useCallback(async () => {
        if (!budgetMonth) return
        for (const cat of MAHASISWA_CATEGORIES) {
            await setBudgetCategory(budgetMonth.id, cat.id, cat.defaultAmount)
        }
        await loadBudget()
    }, [budgetMonth, loadBudget])

    // Change month
    const changeMonth = useCallback((newMonth) => {
        setCurrentMonth(newMonth)
    }, [])

    // Get filtered progress
    const filteredProgress = filterByStatus(progress, filter)

    return {
        // State
        currentMonth,
        budgetMonth,
        categories,
        progress: filteredProgress,
        allProgress: progress,
        summary,
        loading,
        filter,
        hasBudget: categories.length > 0,

        // Actions
        setBudget,
        removeBudget,
        copyPrevious,
        applyMahasiswaTemplate,
        changeMonth,
        setFilter,
        refresh: loadBudget,
    }
}

export default useBudget
