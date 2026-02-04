import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconTarget } from '@tabler/icons-react'

import { useGoals } from '../hooks/useGoals'
import { useHabits } from '../hooks/useHabits'
import { useAccounts } from '../hooks/useFinance'
import { useToast } from '../contexts/ToastContext'
import { GoalsList } from '../components/goals/organisms/GoalsList'
import { GoalSheet } from '../components/goals/organisms/GoalSheet'

/**
 * GoalsPage - Target/Goals management page
 */
function GoalsPage() {
    const navigate = useNavigate()
    const { goals, loading, filter, setFilter, addGoal, editGoal, removeGoal, markComplete, reactivateGoal, refresh } = useGoals()
    const { habits } = useHabits()
    const { accounts } = useAccounts()
    const { showToast } = useToast()

    const [sheetOpen, setSheetOpen] = useState(false)
    const [editingGoal, setEditingGoal] = useState(null)

    const handleGoalClick = (goal) => {
        setEditingGoal(goal)
        setSheetOpen(true)
    }

    const handleAddGoal = () => {
        setEditingGoal(null)
        setSheetOpen(true)
    }

    const handleCloseSheet = () => {
        setSheetOpen(false)
        setEditingGoal(null)
    }

    /**
     * Save goal - handles both create and update
     */
    const handleSaveGoal = async (data) => {
        try {
            if (editingGoal?.id) {
                // Update existing goal
                await editGoal(editingGoal.id, data)
                showToast('success', 'Target berhasil diperbarui')
            } else {
                // Create new goal
                await addGoal(data)
                showToast('success', 'Target baru ditambahkan')
            }
            handleCloseSheet()
        } catch (err) {
            console.error('Failed to save goal:', err)
            showToast('error', 'Gagal menyimpan target')
        }
    }

    /**
     * Delete goal with calm confirmation (from sheet)
     */
    const handleDeleteGoal = async (goalId) => {
        const confirmed = window.confirm(
            'Hapus target ini?\n\nTarget akan dihapus. Kamu bisa membuatnya lagi nanti.'
        )

        if (confirmed) {
            try {
                await removeGoal(goalId)
                showToast('success', 'Target dihapus')
                handleCloseSheet()
            } catch (err) {
                console.error('Failed to delete goal:', err)
                showToast('error', 'Gagal menghapus target')
            }
        }
    }

    /**
     * Quick delete from card (confirmation handled by GoalCard)
     */
    const handleQuickDelete = async (goalId) => {
        try {
            await removeGoal(goalId)
            showToast('success', 'Target dihapus')
        } catch (err) {
            console.error('Failed to delete goal:', err)
            showToast('error', 'Gagal menghapus target')
        }
    }

    /**
     * Mark goal as complete - celebration moment
     */
    const handleMarkComplete = async (goalId) => {
        try {
            await markComplete(goalId)
            showToast('success', 'Target tercapai!')
            handleCloseSheet()
        } catch (err) {
            console.error('Failed to mark complete:', err)
            showToast('error', 'Gagal menandai tercapai')
        }
    }

    /**
     * Reactivate a completed goal
     */
    const handleReactivate = async (goalId) => {
        try {
            await reactivateGoal(goalId)
            showToast('success', 'Target diaktifkan kembali')
            handleCloseSheet()
        } catch (err) {
            console.error('Failed to reactivate goal:', err)
            showToast('error', 'Gagal mengaktifkan kembali')
        }
    }

    return (
        <div className="space-y-4 animate-in">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate('/more')}
                    className="btn-icon"
                    aria-label="Kembali"
                >
                    <IconArrowLeft size={20} stroke={2} />
                </button>
                <div className="flex-1">
                    <h1 className="text-h1 text-ink flex items-center gap-2">
                        <IconTarget size={24} className="text-primary" />
                        <span>Target</span>
                    </h1>
                    <p className="text-small text-ink-muted">
                        {goals.length > 0
                            ? `${goals.filter(g => g.status !== 'completed').length} target aktif · progres berjalan`
                            : 'Pantau progress target kamu'
                        }
                    </p>
                </div>
            </div>

            {/* Goals List */}
            <GoalsList
                goals={goals}
                filter={filter}
                onFilterChange={setFilter}
                onGoalClick={handleGoalClick}
                onDeleteGoal={handleQuickDelete}
                onAddGoal={handleAddGoal}
                loading={loading}
            />

            {/* Goal Sheet */}
            <GoalSheet
                open={sheetOpen}
                onClose={handleCloseSheet}
                onSave={handleSaveGoal}
                onDelete={handleDeleteGoal}
                onMarkComplete={handleMarkComplete}
                onReactivate={handleReactivate}
                accounts={accounts}
                habits={habits}
                editGoal={editingGoal}
            />
        </div>
    )
}

export default GoalsPage

