import { useEffect, useState, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import AppShell from './components/AppShell'
import { SearchProvider } from './contexts/SearchContext'
import { SearchOverlay } from './components/search/organisms/SearchOverlay'
import { QuickCaptureProvider } from './contexts/QuickCaptureContext'
import { QuickCaptureFAB } from './components/capture/QuickCaptureFAB'
import { ToastProvider } from './contexts/ToastContext'
import { ToastContainer } from './components/ui/Toast'
import { useToast } from './contexts/ToastContext'
import { QuickCaptureMenu } from './components/capture/QuickCaptureMenu'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { ReminderProvider } from './contexts/ReminderContext'
import ReminderToast from './components/reminders/ReminderToast'
import { SoundscapesProvider } from './features/soundscapes/SoundscapesProvider'
import { LoginReminderPopup } from './components/settings/LoginReminderPopup'
import { AppPrefsProvider } from './contexts/AppPrefsContext'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { NotificationPermissionPrompt } from './components/NotificationPermissionPrompt'
import { useSmartPermissionRequest } from './hooks/useSmartPermissionRequest'
import { measurePerformance, trackPageLoad } from './utils/performanceMonitor'
import NetworkStatusIndicator from './components/NetworkStatusIndicator'
import PWAUpdatePrompt from './components/PWAUpdatePrompt'

// Loading fallback component
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-screen bg-paper-warm">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-small text-ink-muted">Memuat...</p>
        </div>
    </div>
)

// Lazy load pages for code splitting
// Core pages (frequently accessed) - loaded eagerly
import Today from './pages/Today'
import Auth from './pages/Auth'

// Secondary pages - lazy loaded
const Habits = lazy(() => import('./pages/Habits'))
const HabitDetail = lazy(() => import('./pages/HabitDetail'))
const Journal = lazy(() => import('./pages/Journal'))
const Space = lazy(() => import('./pages/Space'))
const More = lazy(() => import('./pages/More'))
const Finance = lazy(() => import('./pages/Finance'))
const Fokus = lazy(() => import('./pages/Fokus'))
const Goals = lazy(() => import('./pages/Goals'))
const Books = lazy(() => import('./pages/Books'))
const BookDetail = lazy(() => import('./pages/BookDetail'))
const Calendar = lazy(() => import('./pages/Calendar'))
const Stats = lazy(() => import('./pages/Stats'))
const Settings = lazy(() => import('./pages/Settings'))
const Quick = lazy(() => import('./pages/Quick'))
const ReceiveShare = lazy(() => import('./pages/ReceiveShare'))

// Development-only pages
const ColorBlindTest = import.meta.env.DEV 
    ? lazy(() => import('./pages/ColorBlindTest'))
    : null

function AppContent() {
    const { showToast } = useToast()
    const { shouldShowPrompt, handleDismiss, handleGranted } = useSmartPermissionRequest()
    const [showPermissionPrompt, setShowPermissionPrompt] = useState(false)
    const navigate = useNavigate()

    // Listen to service worker messages for notification clicks
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            const handleSWMessage = (event) => {
                if (event.data && event.data.type === 'NAVIGATE') {
                    // Navigate to the route specified by the notification click
                    console.log('[App] Navigating to:', event.data.route)
                    navigate(event.data.route)
                }
            }

            navigator.serviceWorker.addEventListener('message', handleSWMessage)

            return () => {
                navigator.serviceWorker.removeEventListener('message', handleSWMessage)
            }
        }
    }, [navigate])

    // Show notification permission prompt if should show
    useEffect(() => {
        if (shouldShowPrompt) {
            setShowPermissionPrompt(true)
        }
    }, [shouldShowPrompt])

    // Initialize performance monitoring
    useEffect(() => {
        measurePerformance()
    }, [])

    // Track page load on route change
    useEffect(() => {
        trackPageLoad(window.location.pathname)
    }, [window.location.pathname])

    const handlePermissionClose = (granted) => {
        setShowPermissionPrompt(false)
        if (granted) {
            handleGranted()
            showToast('success', 'Notifikasi diaktifkan! 🔔')
        } else {
            handleDismiss('temporary')
        }
    }

    return (
        <>
            <QuickCaptureProvider>
                <SearchProvider>
                    <ReminderProvider>
                        <AppShell>
                            <Suspense fallback={<PageLoader />}>
                                <Routes>
                                    <Route path="/" element={<Today />} />
                                    <Route path="/calendar" element={<Calendar />} />
                                    <Route path="/more/calendar" element={<Calendar />} />
                                    <Route path="/stats" element={<Stats />} />
                                    <Route path="/more/stats" element={<Stats />} />
                                    <Route path="/habits" element={<Habits />} />
                                    <Route path="/habits/:id" element={<HabitDetail />} />
                                    <Route path="/journal" element={<Journal />} />
                                    <Route path="/space" element={<Space />} />
                                    <Route path="/more" element={<More />} />
                                    <Route path="/finance" element={<Finance />} />
                                    <Route path="/more/finance" element={<Finance />} />
                                    <Route path="/fokus" element={<Fokus />} />
                                    <Route path="/more/fokus" element={<Fokus />} />
                                    <Route path="/goals" element={<Goals />} />
                                    <Route path="/more/goals" element={<Goals />} />
                                    <Route path="/books" element={<Books />} />
                                    <Route path="/more/books" element={<Books />} />
                                    <Route path="/books/:id" element={<BookDetail />} />
                                    <Route path="/settings" element={<Settings />} />
                                    <Route path="/quick" element={<Quick />} />
                                    <Route path="/receive-share" element={<ReceiveShare />} />
                                    <Route path="/auth" element={<Auth />} />
                                    
                                    {/* Development-only routes */}
                                    {import.meta.env.DEV && ColorBlindTest && (
                                        <Route path="/dev/color-blind-test" element={<ColorBlindTest />} />
                                    )}
                                </Routes>
                            </Suspense>
                        </AppShell>

                        <SearchOverlay />
                        <QuickCaptureMenu />
                        <QuickCaptureFAB />
                        <ToastContainer />
                        <ReminderToast />
                        <LoginReminderPopup />

                        {/* PWA Components */}
                        <PWAInstallPrompt />
                        <PWAUpdatePrompt />
                        <NetworkStatusIndicator />

                        {/* Notification Permission Prompt */}
                        {showPermissionPrompt && (
                            <NotificationPermissionPrompt onClose={handlePermissionClose} />
                        )}
                    </ReminderProvider>
                </SearchProvider>
            </QuickCaptureProvider>
        </>
    )
}

function App() {
    return (
        <ErrorBoundary>
            <AppPrefsProvider>
                <SoundscapesProvider>
                    <BrowserRouter>
                        <ToastProvider>
                            <AppContent />
                        </ToastProvider>
                    </BrowserRouter>
                </SoundscapesProvider>
            </AppPrefsProvider>
        </ErrorBoundary>
    )
}

export default App
