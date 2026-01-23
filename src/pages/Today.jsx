import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  IconArrowUpRight,
  IconArrowDownRight,
  IconWallet,
} from '@tabler/icons-react'
import { useHabits, useTodayCheckins } from '../hooks/useHabits'
import { useTodayJournals } from '../hooks/useJournals'
import { useTodayPomodoro } from '../hooks/usePomodoro'
import { useCurrentMonthSummary, useAccounts, formatCurrency } from '../hooks/useFinance'
import { useClockMinute } from '../hooks/useClockMinute'
import { useBooks } from '../hooks/useBooks'
import { useToast } from '../contexts/ToastContext'
import { useCalendarData } from '../hooks/useCalendarData'
import { PullToRefresh } from '../components/ui/PullToRefresh'

// Intl formatters for Indonesian locale (outside component for performance)
const fmtDate = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const fmtTime = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
})

// UI Components
import { QuestList } from '../features/quests/components/QuestList'
import ReminderBanner from '../components/reminders/ReminderBanner'
import PomodoroTimer from '../components/PomodoroTimer'
import QuickAddTransaction from '../components/QuickAddFinance'
import { QuickAddHabit } from '../components/today/QuickAddHabit'
import { CollapsibleSection } from '../components/ui/CollapsibleSection'
import { WeeklyReport } from '../components/today/WeeklyReport'

// Primary Widgets (main actions)
import { PrimaryWidgetGrid } from '../components/today/organisms/PrimaryWidgetGrid'
import { PomodoroWidget } from '../components/today/widgets/PomodoroWidget'
import { JournalWidget } from '../components/today/widgets/JournalWidget'

// Secondary Widgets (compact strip)
import { HabitCompact } from '../components/today/widgets/HabitCompact'
import { FinanceCompact } from '../components/today/widgets/FinanceCompact'
import { BookCompact } from '../components/today/widgets/BookCompact'
import { MiniCalendar } from '../components/calendar/MiniCalendar'

/**
 * Today - Home screen with 2-tier visual hierarchy
 * 
 * Structure:
 * - Header (date + greeting)
 * - Primary actions (Fokus + Jurnal)
 * - Secondary strip (Habit + Finance + Books)
 * - Bonus layer (Quest + Insights) - collapsed by default
 */
function Today() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast } = useToast()
  const { habits } = useHabits()
  const { checkins, isChecked } = useTodayCheckins()
  const { journals: todayJournals } = useTodayJournals()
  const { sessionCount, focusMinutes } = useTodayPomodoro()
  const { summary: monthSummary, refresh: refreshSummary } = useCurrentMonthSummary()
  const { netWorth } = useAccounts()

  // Calendar data for weekly report
  const currentDate = new Date()
  const { activitiesByDate } = useCalendarData(
    currentDate.getFullYear(),
    currentDate.getMonth()
  )

  // Clock for header (updates every minute, battery efficient)
  const now = useClockMinute()
  const dateText = fmtDate.format(now)
  const timeText = fmtTime.format(now)

  // Dynamic greeting based on time of day
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 18 ? 'Selamat sore' : 'Selamat malam'

  // Display name from localStorage (user can set in Settings)
  const displayName = localStorage.getItem('lento.profile.displayName') || ''

  // Get currently reading book
  const { primaryBook: currentBook, currentlyReading } = useBooks()

  const [showPomodoro, setShowPomodoro] = useState(false)
  const [showQuickFinance, setShowQuickFinance] = useState(false)
  const [showQuickHabit, setShowQuickHabit] = useState(false)
  const [defaultTxType, setDefaultTxType] = useState('expense')
  const [pomodoroBook, setPomodoroBook] = useState(null)

  const handleStartPomodoroWithBook = (book) => {
    setPomodoroBook(book)
    setShowPomodoro(true)
  }

  const handleClosePomodoro = () => {
    setShowPomodoro(false)
    setPomodoroBook(null)
  }

  // Handle ?open=pomodoro query param from shortcuts
  useEffect(() => {
    const openParam = searchParams.get('open')

    if (openParam === 'pomodoro') {
      setShowPomodoro(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const todayCheckinCount = checkins.length
  const todayJournalCount = todayJournals.length

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Selamat pagi'
    if (hour < 15) return 'Selamat siang'
    if (hour < 18) return 'Selamat sore'
    return 'Selamat malam'
  }

  const formatDate = () => {
    return new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const handleAddFinance = (type) => {
    setDefaultTxType(type)
    setShowQuickFinance(true)
  }

  const handleTransactionSuccess = () => {
    setShowQuickFinance(false)
    refreshSummary()
  }

  // Prepare habits with checked state
  const habitsWithState = habits.map(h => ({
    ...h,
    checked: isChecked(h.id)
  }))

  // Handle quick add habit
  const { create: createHabit } = useHabits()
  const handleCreateHabit = async (habitData) => {
    try {
      await createHabit(habitData)
      showToast('success', `Kebiasaan "${habitData.name}" berhasil ditambahkan! 🎯`)
      setShowQuickHabit(false)
    } catch (error) {
      console.error('Failed to create habit:', error)
      showToast('error', 'Gagal menambahkan kebiasaan')
    }
  }

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    // Refresh all data sources
    await Promise.all([
      refreshSummary(),
      // Force re-fetch by triggering component remounts
    ])
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-6 animate-in overflow-x-hidden pb-4 max-w-full min-w-0">
      {/* ===== HEADER (Clean 3-line stack) ===== */}
      <header className="pb-2">
        {/* Line 1: Date + Time */}
        <div className="text-small text-ink-muted flex items-center gap-2 mb-1">
          <time dateTime={now.toISOString()}>
            {dateText} · {timeText}
          </time>
        </div>

        {/* Line 2: Greeting (personal anchor) */}
        <h1 className="text-h1 text-ink break-words">
          {greeting}, {displayName || 'kamu'} 👋
        </h1>

        {/* Line 3: Tagline (calm tone) */}
        <p className="text-body text-ink-muted mt-1">
          Mulai dari yang kecil aja.
        </p>
      </header>

      {/* Weekly Report - NEW */}
      <WeeklyReport activitiesByDate={activitiesByDate} />

      {/* Pomodoro Timer (when shown) */}
      {showPomodoro && (
        <PomodoroTimer
          onClose={handleClosePomodoro}
          initialBook={pomodoroBook}
        />
      )}

      {/* Reminders (in-app gentle nudges) */}
      <ReminderBanner />

      {/* Quick Finance Form (when shown) */}
      {showQuickFinance && (
        <QuickAddTransaction
          defaultType={defaultTxType}
          onClose={() => setShowQuickFinance(false)}
          onSuccess={handleTransactionSuccess}
        />
      )}

      {/* Quick Habit Form (when shown) */}
      {showQuickHabit && (
        <QuickAddHabit
          onClose={() => setShowQuickHabit(false)}
          onCreate={handleCreateHabit}
        />
      )}

      {/* ===== PRIMARY ACTIONS ===== */}
      {/* 2 most important actions: Focus + Journal */}
      {!showPomodoro && !showQuickFinance && (
        <section className="max-w-full overflow-hidden">
          <p className="text-overline mb-3">Mulai Sekarang</p>
          <PrimaryWidgetGrid>
            <PomodoroWidget
              summary={{ sessionCount, focusMinutes }}
              onStart={() => setShowPomodoro(true)}
              className="widget-primary"
            />
            <JournalWidget
              onQuickSave={async () => {
                navigate('/journal')
              }}
              className="widget-primary"
            />
          </PrimaryWidgetGrid>
        </section>
      )}

      {/* ===== SECONDARY STRIP ===== */}
      {/* Compact widgets for quick access */}
      {!showPomodoro && !showQuickFinance && (
        <section className="max-w-full overflow-hidden">
          <p className="text-overline mb-3">Pintasan</p>
          <div className="secondary-strip-container">
            <div className="secondary-strip">
              <HabitCompact 
                habits={habitsWithState} 
                onQuickAdd={() => setShowQuickHabit(true)}
              />
              <FinanceCompact
                todayExpense={monthSummary.expense || 0}
                onQuickAdd={handleAddFinance}
              />
              <BookCompact currentBook={currentBook} />
            </div>
          </div>

          {/* Mini Calendar Widget */}
          <div className="mt-4">
            <MiniCalendar />
          </div>
        </section>
      )}

      {/* ===== BONUS LAYER ===== */}
      {/* Quest + Insights - collapsed by default (progressive disclosure) */}
      <CollapsibleSection
        id="today-bonus"
        title="Misi & Ringkasan"
        defaultOpen={false}
        badge={`${todayCheckinCount + sessionCount + todayJournalCount} hari ini`}
      >
        {/* Quest Section */}
        <QuestList />

        {/* Insights Section */}
        <div className="space-y-3">
          <p className="text-overline">Ringkasan Bulan Ini</p>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-paper-warm rounded-lg p-3 text-center">
              <p className="text-tiny text-ink-muted">Masuk</p>
              <p className="text-small font-semibold text-success">
                {formatCurrency(monthSummary.income)}
              </p>
            </div>
            <div className="bg-paper-warm rounded-lg p-3 text-center">
              <p className="text-tiny text-ink-muted">Keluar</p>
              <p className="text-small font-semibold text-danger">
                {formatCurrency(monthSummary.expense)}
              </p>
            </div>
            <div className="bg-paper-warm rounded-lg p-3 text-center">
              <p className="text-tiny text-ink-muted">Sisa</p>
              <p className={`text-small font-semibold ${monthSummary.balance >= 0 ? 'text-primary' : 'text-danger'}`}>
                {formatCurrency(monthSummary.balance)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-paper-warm rounded-lg p-2 text-center">
              <p className="text-body font-semibold text-primary">{todayCheckinCount}</p>
              <p className="text-tiny text-ink-muted">Check-in</p>
            </div>
            <div className="bg-paper-warm rounded-lg p-2 text-center">
              <p className="text-body font-semibold text-secondary">{sessionCount}</p>
              <p className="text-tiny text-ink-muted">Fokus</p>
            </div>
            <div className="bg-paper-warm rounded-lg p-2 text-center">
              <p className="text-body font-semibold text-ink-muted">{todayJournalCount}</p>
              <p className="text-tiny text-ink-muted">Jurnal</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/more/finance')}
            className="text-small text-primary hover:underline"
          >
            Lihat detail keuangan →
          </button>
        </div>
      </CollapsibleSection>
    </div>
    </PullToRefresh>
  )
}

export default Today
