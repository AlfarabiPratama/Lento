import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  IconSun,
  IconRepeat,
  IconNotebook,
  IconFileText,
  IconSettings,
  IconSearch,
  IconFocus2,
  IconWallet,
  IconTarget,
  IconBook,
  IconCalendar,
  IconChartBar,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react'
import SyncIndicator from './SyncIndicator'
import LentoWordmarkAnimated from './LentoWordmarkAnimated'
import LentoLettermarkAnimated from './LentoLettermarkAnimated'
import { useSearchContext } from '../contexts/SearchContext'
import { SoundFab } from '../features/soundscapes/SoundFab'
import { SoundPanel } from '../features/soundscapes/SoundPanel'
import { useHabits, useTodayCheckins } from '../hooks/useHabits'
import { useHabitReminders } from '../hooks/useHabitReminders'
import { useScrollDirection } from '../hooks/useScrollDirection'
import { HabitReminderToast } from './reminders/HabitReminderToast'
import { PWAInstallPrompt } from './pwa/PWAInstallPrompt'
import { OfflineIndicator } from './pwa/OfflineIndicator'
import { SkipToContent } from './a11y/FocusManagement'

// Mobile navigation items - includes Search and More
const mobileNavItems = [
  { path: '/', label: 'Hari Ini', icon: IconSun },
  { path: '/habits', label: 'Kebiasaan', icon: IconRepeat },
  { path: '/journal', label: 'Jurnal', icon: IconNotebook },
  { path: '/space', label: 'Ruang', icon: IconFileText },
  { type: 'button', label: 'Cari', icon: IconSearch, action: 'search' }, // Search button
  { path: '/more', label: 'Lainnya', icon: IconSettings },
]

// Desktop navigation items - direct feature access, no More
const desktopNavItems = [
  { path: '/', label: 'Hari Ini', icon: IconSun },
  { path: '/calendar', label: 'Kalender', icon: IconCalendar },
  { path: '/stats', label: 'Statistik', icon: IconChartBar },
  { path: '/habits', label: 'Kebiasaan', icon: IconRepeat },
  { path: '/journal', label: 'Jurnal', icon: IconNotebook },
  { path: '/space', label: 'Ruang', icon: IconFileText },
  { path: '/books', label: 'Buku', icon: IconBook },
  { path: '/more/fokus', label: 'Fokus', icon: IconFocus2 },
  { path: '/more/finance', label: 'Keuangan', icon: IconWallet },
  { path: '/more/goals', label: 'Target', icon: IconTarget },
  { path: '/settings', label: 'Pengaturan', icon: IconSettings },
]

function AppShell({ children }) {
  const { openSearch } = useSearchContext()
  const { habits } = useHabits()
  const { checkIn } = useTodayCheckins()
  const [activeReminder, setActiveReminder] = useState(null)
  const scrollDirection = useScrollDirection(10)

  // Initialize habit reminders - check every minute
  useHabitReminders(habits, (habit) => {
    setActiveReminder(habit)
  })

  const [navCollapsed, setNavCollapsed] = useState(() => {
    try {
      return localStorage.getItem('lento.nav.collapsed') === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('lento.nav.collapsed', navCollapsed ? '1' : '0')
    } catch {
      // ignore
    }
  }, [navCollapsed])

  return (
    <div className="min-h-[100dvh] bg-paper flex max-w-[100vw] overflow-x-hidden">
      {/* Skip to content link for keyboard users */}
      <SkipToContent />
      
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col border-r border-line bg-surface fixed h-[100dvh] transition-all duration-200 ${navCollapsed ? 'w-[72px]' : 'w-60'}`} role="navigation" aria-label="Main navigation">
        {/* Logo + collapse */}
        <div className="px-3 py-4 border-b border-line/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {navCollapsed ? <LentoLettermarkAnimated size="default" /> : <LentoWordmarkAnimated size="default" />}
          </div>
          <button
            onClick={() => setNavCollapsed(!navCollapsed)}
            aria-label={navCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            aria-expanded={!navCollapsed}
            aria-controls="sidebar-nav"
            className="w-11 h-11 rounded-lg hover:bg-paper-warm text-ink-muted flex items-center justify-center transition-colors"
          >
            {navCollapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav id="sidebar-nav" className="flex-1 p-2 space-y-1 overflow-y-auto">
          {desktopNavItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center ${navCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-small font-medium transition-all duration-normal ${isActive
                    ? 'bg-primary-50 text-primary'
                    : 'text-ink-muted hover:bg-paper-warm hover:text-ink'
                  }`
                }
                title={navCollapsed ? item.label : undefined}
              >
                <Icon size={24} stroke={2} />
                {!navCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-line/50 space-y-3">
          <button
            onClick={openSearch}
            className={`w-full flex items-center ${navCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-small font-medium text-ink-muted hover:bg-paper-warm hover:text-ink transition-all`}
            title={navCollapsed ? 'Cari (⌘K)' : undefined}
          >
            <IconSearch size={20} stroke={2} />
            {!navCollapsed && (
              <>
                <span>Cari...</span>
                <span className="ml-auto text-tiny bg-paper-warm px-1.5 py-0.5 rounded border border-line">⌘K</span>
              </>
            )}
          </button>
          {!navCollapsed && <SyncIndicator />}
          {!navCollapsed && (
            <div className="text-caption text-ink-soft text-center">
              v0.1.0
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-h-[100dvh] transition-all duration-200 ${navCollapsed ? 'lg:ml-[72px]' : 'lg:ml-60'}`}>
        {/* Mobile header - HIDDEN to save space, search accessible via bottom nav */}
        <header className="hidden">
          {/* Header completely hidden on mobile for maximum content space */}
          {/* Logo and search accessible through desktop sidebar and bottom nav */}
        </header>

        {/* Page content */}
        <main 
          id="main-content"
          tabIndex={-1}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-[calc(var(--bottom-nav-h)+var(--safe-area-bottom))] lg:pb-6 focus:outline-none"
          role="main"
          aria-label="Main content"
        >
          <div className="w-full lg:max-w-content mx-auto px-3 sm:px-4 py-5 lg:px-6 lg:py-6">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav 
          className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-sm border-t border-line flex items-center justify-around py-2 px-1 z-20 pb-[calc(8px+var(--safe-area-bottom))]"
          role="navigation"
          aria-label="Mobile navigation"
        >
          {mobileNavItems.map((item, index) => {
            const Icon = item.icon
            
            // Handle search button (type: button)
            if (item.type === 'button' && item.action === 'search') {
              return (
                <button
                  key={`${item.label}-${index}`}
                  onClick={openSearch}
                  className="flex flex-col items-center gap-1 py-1.5 px-2 min-w-[56px] rounded-lg transition-all duration-normal text-ink-muted active:bg-paper-warm"
                  aria-label={item.label}
                >
                  <Icon size={24} stroke={2} />
                  <span className="text-tiny font-medium">{item.label}</span>
                </button>
              )
            }
            
            // Handle regular nav links
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-1.5 px-2 min-w-[56px] rounded-lg transition-all duration-normal ${isActive
                    ? 'text-primary'
                    : 'text-ink-muted active:bg-paper-warm'
                  }`
                }
              >
                <Icon size={24} stroke={2} />
                <span className="text-tiny font-medium">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Global Soundscapes UI */}
        <SoundFab />
        <SoundPanel />

        {/* PWA Components - Priority 2 */}
        <PWAInstallPrompt />
        <OfflineIndicator />

        {/* Habit Reminder Toast */}
        {activeReminder && (
          <HabitReminderToast
            habit={activeReminder}
            onComplete={(habit) => {
              checkIn(habit.id)
              setActiveReminder(null)
            }}
            onDismiss={() => setActiveReminder(null)}
          />
        )}
      </div>
    </div>
  )
}

export default AppShell
