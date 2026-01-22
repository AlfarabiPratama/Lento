import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppShell from './components/AppShell'
import Today from './pages/Today'
import Habits from './pages/Habits'
import Journal from './pages/Journal'
import Space from './pages/Space'
import More from './pages/More'
import Finance from './pages/Finance'
import Fokus from './pages/Fokus'
import Goals from './pages/Goals'
import Quick from './pages/Quick'
import ReceiveShare from './pages/ReceiveShare'
import Auth from './pages/Auth'
import Settings from './pages/Settings'
import Books from './pages/Books'
import BookDetail from './pages/BookDetail'
import Calendar from './pages/Calendar'
import Stats from './pages/Stats'
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

function AppContent() {
    const { showToast } = useToast()
    const { shouldShowPrompt, handleDismiss, handleGranted } = useSmartPermissionRequest()
    const [showPermissionPrompt, setShowPermissionPrompt] = useState(false)
    const [updateAvailable, setUpdateAvailable] = useState(false)
    const [waitingWorker, setWaitingWorker] = useState(null)

    // Best Practice PWA: Handle SW updates gracefully
    useEffect(() => {
        const handleSWUpdate = (event) => {
            const registration = event.detail
            setWaitingWorker(registration.waiting)
            setUpdateAvailable(true)
            
            showToast('info', 'Update tersedia! Klik untuk reload.', {
                duration: 0, // Don't auto-dismiss
                action: {
                    label: 'Update',
                    onClick: () => {
                        if (registration.waiting) {
                            registration.waiting.postMessage({ type: 'SKIP_WAITING' })
                            window.location.reload()
                        }
                    }
                }
            })
        }

        window.addEventListener('sw-update', handleSWUpdate)

        // Handle SW controller change
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                showToast('success', 'App telah diperbarui! 🎉', { duration: 3000 })
            })
        }

        return () => {
            window.removeEventListener('sw-update', handleSWUpdate)
        }
    }, [showToast])

    // Show notification permission prompt if should show
    useEffect(() => {
        if (shouldShowPrompt) {
            setShowPermissionPrompt(true)
        }
    }, [shouldShowPrompt])

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
                            <Routes>
                                <Route path="/" element={<Today />} />
                                <Route path="/calendar" element={<Calendar />} />
                                <Route path="/more/calendar" element={<Calendar />} />
                                <Route path="/stats" element={<Stats />} />
                                <Route path="/more/stats" element={<Stats />} />
                                <Route path="/habits" element={<Habits />} />
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
                            </Routes>
                        </AppShell>

                        <SearchOverlay />
                        <QuickCaptureMenu />
                        <QuickCaptureFAB />
                        <ToastContainer />
                        <ReminderToast />
                        <LoginReminderPopup />

                        {/* PWA Install Prompt */}
                        <PWAInstallPrompt />

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
