/**
 * PendingHabitsWidget - Shows habits waiting for check-in
 * 
 * Prominent display of pending habits to increase completion rate
 * Shows up to 3 pending habits with quick check-in buttons
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconCheck, IconPlus, IconFlame, IconChevronRight } from '@tabler/icons-react'
import { HabitIcon } from '../../lib/habitIcons'
import { PendingHabitsWidgetSkeleton } from './skeletons/WidgetSkeletons'
import { ConfettiCanvas } from '../animations/Confetti'
import { triggerHaptic, HapticPattern } from '../../utils/haptics.jsx'

/**
 * Individual pending habit card
 */
function PendingHabitCard({ habit, onCheckIn, onTriggerCelebration }) {
  const handleCheckIn = async () => {
    // Haptic feedback
    triggerHaptic(HapticPattern.SUCCESS)
    
    // Call parent check-in handler
    await onCheckIn(habit.id)
    
    // Trigger celebration
    onTriggerCelebration?.()
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-paper-warm rounded-lg border border-line hover:border-primary/30 transition-colors group">
      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
        <HabitIcon name={habit.icon || 'IconFlame'} size={20} className="text-primary" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-small font-medium text-ink truncate">
          {habit.name}
        </h3>
        {habit.streak_current > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            <IconFlame size={12} className="text-warning" />
            <span className="text-tiny text-ink-muted">
              {habit.streak_current} hari streak
            </span>
          </div>
        )}
      </div>

      {/* Quick Check-in Button */}
      <button
        onClick={handleCheckIn}
        className="btn btn-primary btn-sm btn-circle flex-shrink-0"
        aria-label={`Check-in ${habit.name}`}
      >
        <IconCheck size={18} />
      </button>
    </div>
  )
}

/**
 * All habits completed celebration
 */
function AllCompleteMessage({ totalHabits, onViewAll }) {
  return (
    <div className="bg-gradient-to-br from-success/10 to-success/5 border border-success/20 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
          <IconCheck size={20} className="text-success" />
        </div>
        <div className="flex-1">
          <h3 className="text-small font-semibold text-success mb-1">
            Semua kebiasaan selesai! 🎉
          </h3>
          <p className="text-tiny text-ink-muted mb-3">
            {totalHabits} kebiasaan hari ini sudah di-check-in. Konsistensi yang bagus!
          </p>
          <button
            onClick={onViewAll}
            className="text-tiny text-success hover:underline flex items-center gap-1"
          >
            Lihat semua kebiasaan
            <IconChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Empty state - no habits registered yet
 */
function NoHabitsMessage({ onAddHabit }) {
  return (
    <div className="bg-paper-warm border border-line rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <IconFlame size={20} className="text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-small font-semibold text-ink mb-1">
            Belum ada kebiasaan terdaftar
          </h3>
          <p className="text-tiny text-ink-muted mb-3">
            Mulai perjalanan Anda dengan satu kebiasaan kecil yang mudah dilakukan setiap hari.
          </p>
          <button
            onClick={onAddHabit}
            className="btn btn-primary btn-sm gap-2"
          >
            <IconPlus size={16} />
            Tambah Kebiasaan Pertama
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * PendingHabitsWidget Component
 */
export function PendingHabitsWidget({ 
  habits = [], 
  onCheckIn, 
  onQuickAdd,
  isLoading = false,
  className = '' 
}) {
  const navigate = useNavigate()
  const [showConfetti, setShowConfetti] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)

  // Show skeleton during loading
  if (isLoading) {
    return (
      <div className={className}>
        <PendingHabitsWidgetSkeleton />
      </div>
    )
  }

  // Filter pending and completed habits
  const pendingHabits = habits.filter(h => !h.checked)
  const completedHabits = habits.filter(h => h.checked)
  const totalHabits = habits.length

  // No habits registered yet
  if (totalHabits === 0) {
    return (
      <div className={className}>
        <NoHabitsMessage onAddHabit={onQuickAdd} />
      </div>
    )
  }

  // All habits completed
  if (pendingHabits.length === 0) {
    return (
      <div className={className}>
        <AllCompleteMessage 
          totalHabits={totalHabits}
          onViewAll={() => navigate('/habits')}
        />
      </div>
    )
  }

  // Has pending habits
  const showCount = Math.min(pendingHabits.length, 3)
  const remainingCount = pendingHabits.length - showCount

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IconFlame size={20} className="text-primary" />
          <h2 className="text-h2 text-ink">Kebiasaan Hari Ini</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-primary badge-sm">
            {pendingHabits.length}
          </span>
          {completedHabits.length > 0 && (
            <span className="text-tiny text-success">
              {completedHabits.length} selesai
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="h-2 bg-paper-warm rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all duration-500"
            style={{ width: `${(completedHabits.length / totalHabits) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-tiny text-ink-muted">
            {completedHabits.length}/{totalHabits} selesai
          </span>
          <span className="text-tiny font-medium text-ink">
            {Math.round((completedHabits.length / totalHabits) * 100)}%
          </span>
        </div>
      </div>

      {/* Pending Habits List */}
      <div className="space-y-2">
        {pendingHabits.slice(0, showCount).map(habit => (
          <PendingHabitCard
            key={habit.id}
            habit={habit}
            onCheckIn={async (habitId) => {
              await onCheckIn(habitId)
              
              // Check if this was the last pending habit
              if (pendingHabits.length === 1) {
                // ALL HABITS COMPLETE! 🎉
                setShowConfetti(true)
                triggerHaptic(HapticPattern.CELEBRATION)
                setJustCompleted(true)
                setTimeout(() => setJustCompleted(false), 3000)
              }
            }}
            onTriggerCelebration={() => {
              // Single habit completion feedback
              triggerHaptic(HapticPattern.SUCCESS)
            }}
          />
        ))}
      </div>

      {/* Show More / View All */}
      {remainingCount > 0 && (
        <button
          onClick={() => navigate('/habits')}
          className="btn btn-ghost btn-sm w-full mt-2 gap-2"
        >
          Lihat {remainingCount} kebiasaan lainnya
          <IconChevronRight size={16} />
        </button>
      )}

      {/* Confetti Celebration */}
      <ConfettiCanvas 
        trigger={showConfetti}
        duration={3000}
        particleCount={80}
        onComplete={() => setShowConfetti(false)}
      />
    </div>
  )
}

export default PendingHabitsWidget
