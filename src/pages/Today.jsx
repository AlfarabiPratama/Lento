import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  IconArrowUpRight,
  IconArrowDownRight,
  IconWallet,
  IconSparkles,
  IconFlame,
  IconHeart,
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

// Motivational taglines (rotates daily)
const TAGLINES = [
  'perlahan tapi pasti.',
  'mulai dari yang kecil aja.',
  'konsisten lebih penting dari sempurna.',
  'progres adalah progres, sekecil apapun.',
  'fokus pada hari ini.',
  'satu langkah lebih dekat.',
  'ritme yang tenang.',
  'belajar tanpa berpikir sia-sia.',
]

// Get tagline based on day of year (consistent per day)
function getDailyTagline() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now - start
  const oneDay = 1000 * 60 * 60 * 24
  const dayOfYear = Math.floor(diff / oneDay)
  return TAGLINES[dayOfYear % TAGLINES.length]
}

// Get header gradient based on time of day
function getTimeGradient(hour) {
  if (hour >= 5 && hour < 11) {
    // Pagi: Sunrise soft gradient
    return 'bg-gradient-to-br from-orange-50 via-pink-50 to-paper-warm'
  } else if (hour >= 11 && hour < 16) {
    // Siang: Bright sky
    return 'bg-gradient-to-br from-blue-50 via-cyan-50 to-paper-warm'
  } else if (hour >= 16 && hour < 19) {
    // Sore: Golden hour
    return 'bg-gradient-to-br from-amber-50 via-orange-50 to-paper-warm'
  } else {
    // Malam: Deep calm
    return 'bg-gradient-to-br from-indigo-50 via-purple-50 to-paper-warm'
  }
}

// Smart encouragement based on user behavior
function getEncouragementMessage(stats) {
  const { 
    hasAnyActivity,
    habitCount,
    completedHabits,
    pendingHabits,
    journalCount,
    focusMinutes,
    currentStreak
  } = stats

  const hour = new Date().getHours()

  // First time user - no habits registered yet
  if (habitCount === 0) {
    return {
      message: 'Belum ada kebiasaan terdaftar. Yuk mulai perjalanan dengan satu kebiasaan kecil!',
      type: 'gentle',
      cta: 'add-habit'
    }
  }

  // Has habits but none completed today
  if (pendingHabits > 0 && completedHabits === 0) {
    if (hour < 12) {
      return {
        message: `${pendingHabits} kebiasaan menunggu check-in. Pagi yang bagus untuk memulai!`,
        type: 'nudge',
        cta: 'view-habits'
      }
    } else if (hour < 18) {
      return {
        message: `Masih ada ${pendingHabits} kebiasaan yang menunggu. Mulai dari yang paling mudah!`,
        type: 'nudge',
        cta: 'view-habits'
      }
    } else {
      return {
        message: `${pendingHabits} kebiasaan belum selesai. Sempat check-in satu sebelum tidur?`,
        type: 'gentle',
        cta: 'view-habits'
      }
    }
  }

  // No activity yet today (no check-ins, no journal, no focus)
  if (!hasAnyActivity) {
    if (hour < 12) {
      return { 
        message: 'Pagi yang tenang. Mulai dari satu aktivitas kecil?',
        type: 'gentle'
      }
    } else if (hour < 18) {
      return { 
        message: 'Belum ada aktivitas hari ini. Yuk mulai sekarang!',
        type: 'nudge'
      }
    } else {
      return { 
        message: 'Masih ada waktu untuk satu aktivitas kecil.',
        type: 'gentle'
      }
    }
  }

  // On streak!
  if (currentStreak >= 7) {
    return {
      message: `Streak ${currentStreak} hari! Momentum sempurna, terus jaga ritme.`,
      type: 'celebration'
    }
  }
  
  if (currentStreak >= 3) {
    return {
      message: `${currentStreak} hari berturut! Kebiasaan mulai terbentuk.`,
      type: 'praise'
    }
  }

  // Good progress today
  if (completedHabits > 0 && habitCount > 0) {
    const percentage = (completedHabits / habitCount) * 100
    if (percentage >= 80) {
      return {
        message: `${completedHabits}/${habitCount} habit selesai. Hari yang produktif!`,
        type: 'praise'
      }
    } else if (percentage >= 50) {
      return {
        message: `${completedHabits}/${habitCount} habit. Progres bagus, lanjutkan!`,
        type: 'encouragement'
      }
    } else {
      return {
        message: `Sudah mulai hari ini. Satu langkah lebih baik dari nol.`,
        type: 'gentle'
      }
    }
  }

  // Has journal or focus
  if (journalCount > 0 || focusMinutes > 0) {
    return {
      message: 'Sudah mulai meluangkan waktu untuk diri sendiri. Bagus!',
      type: 'praise'
    }
  }

  // Default gentle encouragement
  return {
    message: 'Setiap langkah kecil itu berarti.',
    type: 'gentle'
  }
}

// UI Components
import { QuestList } from '../features/quests/components/QuestList'
import ReminderBanner from '../components/reminders/ReminderBanner'
import PomodoroTimer from '../components/PomodoroTimer'
import QuickAddTransaction from '../components/QuickAddFinance'
import { QuickAddHabit } from '../components/today/QuickAddHabit'
import { CollapsibleSection } from '../components/ui/CollapsibleSection'
import { WeeklyReport } from '../components/today/WeeklyReport'
import { PendingHabitsWidget } from '../components/today/PendingHabitsWidget'
import { MiniCalendar } from '../components/calendar/MiniCalendar'

// Quick Action Cards (new 2x2 grid)
import {
  HabitsActionCard,
  FocusActionCard,
  FinanceActionCard,
  BooksActionCard
} from '../components/today/QuickActionCards'

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
  const { habits, loading: habitsLoading } = useHabits()
  const { checkins, isChecked, checkIn, loading: checkinsLoading } = useTodayCheckins()
  const { journals: todayJournals } = useTodayJournals()
  const { sessionCount, focusMinutes } = useTodayPomodoro()
  const { summary: monthSummary, refresh: refreshSummary } = useCurrentMonthSummary()
  const { netWorth } = useAccounts()

  // Calculate today's expense (for FinanceActionCard)
  const todayExpense = monthSummary?.expense || 0 // TODO: Get actual today's expense if available

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

  // Daily tagline (rotates based on day of year)
  const tagline = getDailyTagline()

  // Dynamic header gradient based on time
  const headerGradient = getTimeGradient(hour)

  // Calculate current streak from calendar data
  const todayKey = currentDate.toISOString().split('T')[0]
  const calculateCurrentStreak = () => {
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateKey = checkDate.toISOString().split('T')[0]
      const activities = activitiesByDate[dateKey]
      
      if (activities && (
        activities.habits?.length > 0 ||
        activities.focus?.length > 0 ||
        activities.journals?.length > 0 ||
        activities.books?.length > 0
      )) {
        streak++
      } else if (i > 0) {
        // Stop counting if we hit a day with no activity (but allow today to be empty)
        break
      }
    }
    return streak
  }

  // Smart encouragement stats
  const encouragementStats = {
    hasAnyActivity: checkins.length > 0 || todayJournals.length > 0 || sessionCount > 0,
    habitCount: habits.length,
    completedHabits: checkins.length,
    pendingHabits: habits.length - checkins.length,
    journalCount: todayJournals.length,
    focusMinutes,
    currentStreak: calculateCurrentStreak()
  }

  const encouragement = getEncouragementMessage(encouragementStats)

  // Get currently reading book
  const { primaryBook: currentBook, currentlyReading, loading: booksLoading } = useBooks()

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
      showToast('success', `Kebiasaan "${habitData.name}" berhasil ditambahkan!`)
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
      {/* ===== HEADER (Clean 3-line stack with glassmorphism effect) ===== */}
      <header className={`pb-4 pt-3 px-4 rounded-3xl transition-colors duration-700 
        bg-surface/80 backdrop-blur-sm border border-line/30
        shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.2)]
        ${headerGradient}`}>
        {/* Line 1: Date + Time */}
        <div className="text-small text-ink-muted flex items-center gap-2 mb-1">
          <time dateTime={now.toISOString()}>
            {dateText} · {timeText}
          </time>
        </div>

        {/* Line 2: Greeting (personal anchor) */}
        <h1 className="text-h1 text-ink break-words">
          {greeting}, {displayName || 'kamu'}.
        </h1>

        {/* Line 3: Tagline (calm tone, rotates daily) */}
        <p className="text-body text-ink-muted mt-1 italic pl-3 border-l-2 border-line">
          {tagline}
        </p>

        {/* Smart Encouragement Message */}
        <div className={`
          mt-3 px-3 py-2 rounded-lg flex items-start gap-2
          ${encouragement.type === 'celebration' ? 'bg-primary/10 border border-primary/20' : ''}
          ${encouragement.type === 'praise' ? 'bg-success/10 border border-success/20' : ''}
          ${encouragement.type === 'encouragement' ? 'bg-warning/10 border border-warning/20' : ''}
          ${encouragement.type === 'nudge' ? 'bg-secondary/10 border border-secondary/20' : ''}
          ${encouragement.type === 'gentle' ? 'bg-ink/5 border border-line' : ''}
        `}>
          {encouragement.type === 'celebration' && <IconFlame size={18} className="text-primary flex-shrink-0 mt-0.5" />}
          {encouragement.type === 'praise' && <IconSparkles size={18} className="text-success flex-shrink-0 mt-0.5" />}
          {(encouragement.type === 'encouragement' || encouragement.type === 'nudge') && <IconHeart size={18} className="text-secondary flex-shrink-0 mt-0.5" />}
          {encouragement.type === 'gentle' && <IconSparkles size={18} className="text-ink-muted flex-shrink-0 mt-0.5" />}
          <p className="text-small text-ink-muted flex-1">
            {encouragement.message}
          </p>
        </div>
      </header>

      {/* Weekly Report */}
      <WeeklyReport 
        activitiesByDate={activitiesByDate} 
        isLoading={habitsLoading || checkinsLoading}
      />

      {/* Pending Habits Widget - Hero Section */}
      {!showPomodoro && !showQuickFinance && habits.length > 0 && (
        <section className="max-w-full overflow-hidden">
          <PendingHabitsWidget
            habits={habitsWithState}
            isLoading={habitsLoading || checkinsLoading}
            onCheckIn={async (habitId) => {
              try {
                await checkIn(habitId)
                showToast('success', 'Check-in berhasil! 🎉')
              } catch (error) {
                console.error('Check-in failed:', error)
                showToast('error', 'Gagal check-in')
              }
            }}
            onQuickAdd={() => setShowQuickHabit(true)}
          />
        </section>
      )}

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

      {/* ===== QUICK ACTIONS GRID (2x2) ===== */}
      {/* Most important actions in accessible grid */}
      {!showPomodoro && !showQuickFinance && (
        <section className="max-w-full overflow-hidden">
          <p className="text-overline mb-3">Aksi Cepat</p>
          
          {/* 2x2 Grid - No horizontal scrolling */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Row 1: Habits + Focus (most important) */}
            <HabitsActionCard
              habits={habitsWithState}
              onQuickAdd={() => setShowQuickHabit(true)}
              isLoading={habitsLoading || checkinsLoading}
            />
            <FocusActionCard
              sessionCount={sessionCount}
              focusMinutes={focusMinutes}
            />
            
            {/* Row 2: Finance + Books (secondary but visible) */}
            <FinanceActionCard
              todayExpense={todayExpense}
              monthlyBudget={5000000}
              totalExpense={monthSummary.expense || 0}
              onQuickAdd={handleAddFinance}
              isLoading={false}
            />
            <BooksActionCard
              currentBook={currentBook}
              isLoading={booksLoading}
            />
          </div>

          {/* Mini Calendar - Progressive disclosure */}
          <CollapsibleSection
            id="today-calendar"
            title="Kalender Bulanan"
            defaultOpen={false}
            className="mt-0"
          >
            <MiniCalendar />
          </CollapsibleSection>
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
