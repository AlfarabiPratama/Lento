/**
 * Quick Action Cards - Specialized implementations for Today page
 * 
 * These cards replace the old secondary strip with a consistent 2x2 grid
 */

import { useNavigate } from 'react-router-dom'
import {
  IconChecklist,
  IconFlame,
  IconWallet,
  IconBook,
  IconBulb,
  IconNotebook
} from '@tabler/icons-react'
import { QuickActionCard, QuickActionCardSkeleton } from './QuickActionCard'
import { formatCurrencyCompact } from '../finance/atoms/Money'

/**
 * HabitsActionCard - Quick access to habits with progress
 */
export function HabitsActionCard({
  habits = [],
  onQuickAdd,
  isLoading = false,
  className = ''
}) {
  const navigate = useNavigate()

  const total = habits.length
  const completed = habits.filter(h => h.checked).length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak_current || 0), 0)

  const subtitle = total > 0 ? `${completed}/${total} selesai` : 'Belum ada'
  const footer = maxStreak > 0 ? `${maxStreak} hari streak` : null

  return (
    <QuickActionCard
      title="Kebiasaan"
      subtitle={subtitle}
      icon={IconChecklist}
      iconBg="bg-orange-100"
      iconColor="text-orange-600"
      progress={total > 0 ? percentage : null}
      progressColor="from-orange-400 to-orange-500"
      badge={total > 0 ? `${percentage}%` : null}
      footer={footer}
      onClick={() => navigate('/habits')}
      onQuickAdd={onQuickAdd}
      isLoading={isLoading}
      skeleton={<QuickActionCardSkeleton />}
      className={className}
    />
  )
}

/**
 * FocusActionCard - Quick access to Pomodoro/Focus
 */
export function FocusActionCard({
  sessionCount = 0,
  focusMinutes = 0,
  className = ''
}) {
  const navigate = useNavigate()

  const subtitle = sessionCount > 0
    ? `${sessionCount} sesi`
    : 'Mulai fokus'

  const footer = focusMinutes > 0
    ? `${focusMinutes} menit hari ini`
    : 'Pomodoro timer'

  return (
    <QuickActionCard
      title="Fokus"
      subtitle={subtitle}
      icon={IconBulb}
      iconBg="bg-primary/10"
      iconColor="text-primary"
      progress={null}
      badge={null}
      footer={footer}
      onClick={() => navigate('/fokus')}
      onQuickAdd={null}
      className={className}
    />
  )
}

/**
 * FinanceActionCard - Quick access to finance with budget status
 */
export function FinanceActionCard({
  todayExpense = 0,
  monthlyBudget = 5000000,
  totalExpense = 0,
  onQuickAdd,
  isLoading = false,
  className = ''
}) {
  const navigate = useNavigate()

  const remaining = monthlyBudget - totalExpense
  const percentUsed = monthlyBudget > 0 ? (totalExpense / monthlyBudget) * 100 : 0
  const isOverBudget = remaining < 0
  const isNearLimit = !isOverBudget && percentUsed > 80

  const subtitle = todayExpense > 0
    ? formatCurrencyCompact(todayExpense)
    : 'Belum ada'

  const footer = isOverBudget
    ? `Over ${formatCurrencyCompact(Math.abs(remaining))}`
    : `Sisa ${formatCurrencyCompact(remaining)}`

  const iconBg = isOverBudget
    ? 'bg-red-100'
    : isNearLimit
    ? 'bg-yellow-100'
    : 'bg-green-100'

  const iconColor = isOverBudget
    ? 'text-red-600'
    : isNearLimit
    ? 'text-yellow-600'
    : 'text-green-600'

  const progressColor = isOverBudget
    ? 'from-red-400 to-red-500'
    : isNearLimit
    ? 'from-yellow-400 to-yellow-500'
    : 'from-green-400 to-green-500'

  return (
    <QuickActionCard
      title="Pengeluaran"
      subtitle={subtitle}
      icon={IconWallet}
      iconBg={iconBg}
      iconColor={iconColor}
      progress={Math.min(percentUsed, 100)}
      progressColor={progressColor}
      badge={`${Math.round(percentUsed)}%`}
      footer={footer}
      onClick={() => navigate('/more/finance')}
      onQuickAdd={onQuickAdd}
      isLoading={isLoading}
      skeleton={<QuickActionCardSkeleton />}
      className={className}
    />
  )
}

/**
 * BooksActionCard - Quick access to current reading
 */
export function BooksActionCard({
  currentBook = null,
  isLoading = false,
  className = ''
}) {
  const navigate = useNavigate()

  const currentPage = currentBook?.current_page || 0
  const totalPages = currentBook?.total_pages || 0
  const progressPercent = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0

  const subtitle = currentBook?.title || 'Pilih buku'
  const footer = currentBook && totalPages > 0
    ? `Hal. ${currentPage.toLocaleString('id-ID')} dari ${totalPages.toLocaleString('id-ID')}`
    : 'Mulai membaca'

  return (
    <QuickActionCard
      title="Sedang Dibaca"
      subtitle={subtitle}
      icon={IconBook}
      iconBg="bg-purple-100"
      iconColor="text-purple-600"
      progress={currentBook && totalPages > 0 ? progressPercent : null}
      progressColor="from-purple-400 to-purple-500"
      badge={currentBook && totalPages > 0 ? `${progressPercent}%` : null}
      footer={footer}
      onClick={() => navigate(currentBook ? `/books/${currentBook.id}` : '/books')}
      onQuickAdd={null}
      isLoading={isLoading}
      skeleton={<QuickActionCardSkeleton />}
      className={className}
    />
  )
}

/**
 * JournalActionCard - Quick access to journal
 */
export function JournalActionCard({
  todayJournalCount = 0,
  onQuickAdd,
  className = ''
}) {
  const navigate = useNavigate()

  const subtitle = todayJournalCount > 0
    ? `${todayJournalCount} entri hari ini`
    : 'Tulis pikiran'

  const footer = 'Refleksi harian'

  return (
    <QuickActionCard
      title="Jurnal"
      subtitle={subtitle}
      icon={IconNotebook}
      iconBg="bg-blue-100"
      iconColor="text-blue-600"
      progress={null}
      badge={null}
      footer={footer}
      onClick={() => navigate('/journal')}
      onQuickAdd={onQuickAdd}
      className={className}
    />
  )
}
