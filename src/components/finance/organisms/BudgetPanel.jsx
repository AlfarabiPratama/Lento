import { useState } from 'react'
import { useBudget } from '../../../hooks/useBudget'
import { BudgetHeader } from './BudgetHeader'
import { BudgetCategoryList } from './BudgetCategoryList'
import { BudgetSetupSheet } from './BudgetSetupSheet'
import { getPreviousMonth } from '../../../features/finance/budget/budgetRepo'

/**
 * BudgetPanel - Complete budget view panel
 */
export function BudgetPanel({ className = '' }) {
    const {
        currentMonth,
        summary,
        progress,
        filter,
        loading,
        hasBudget,
        categories,
        setBudget,
        copyPrevious,
        changeMonth,
        setFilter,
        refresh,
    } = useBudget()

    const [setupOpen, setSetupOpen] = useState(false)

    // Navigate to previous month
    const handlePrevMonth = () => {
        changeMonth(getPreviousMonth(currentMonth))
    }

    // Navigate to next month
    const handleNextMonth = () => {
        const [year, month] = currentMonth.split('-').map(Number)
        const next = new Date(year, month, 1) // month is already 1-based, so this gives next month
        const nextMonth = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
        changeMonth(nextMonth)
    }

    // Handle copy from previous
    const handleCopyPrevious = async () => {
        const result = await copyPrevious()
        if (!result.success) {
            alert('Tidak ada budget di bulan sebelumnya')
        }
    }

    // Handle save from setup sheet
    const handleSaveBudgets = async (budgetEntries) => {
        for (const entry of budgetEntries) {
            await setBudget(entry.categoryId, entry.amount)
        }
        await refresh()
    }

    return (
        <div className={`space-y-6 ${className}`}>
            <BudgetHeader
                currentMonth={currentMonth}
                summary={summary}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onCopyPrevious={!hasBudget ? handleCopyPrevious : undefined}
            />

            <BudgetCategoryList
                categories={progress}
                filter={filter}
                onFilterChange={setFilter}
                onCategoryClick={(cat) => console.log('Edit category:', cat)}
                onAddCategory={() => setSetupOpen(true)}
                loading={loading}
            />

            <BudgetSetupSheet
                open={setupOpen}
                onClose={() => setSetupOpen(false)}
                onSave={handleSaveBudgets}
                existingCategories={categories}
            />
        </div>
    )
}

export default BudgetPanel
