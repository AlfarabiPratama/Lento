import { useState, useEffect, useCallback } from 'react'
import * as pomodoro from '../lib/pomodoro'
import { createSession as createBookSession } from '../lib/bookSessionsRepo'
import { getBookById, updateBook } from '../lib/booksRepo'
import { requestWakeLock, releaseWakeLock, handleVisibilityChange } from '../lib/wakeLock'
import { useAuth } from './useAuth'
import { db } from '../lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

/**
 * Hook for Pomodoro settings
 */
export function usePomodoroSettings() {
    const [settings, setSettings] = useState(pomodoro.POMODORO_DEFAULTS)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        pomodoro.getSettings().then(s => {
            setSettings(s)
            setLoading(false)
        })
    }, [])

    const updateSettings = useCallback(async (updates) => {
        const newSettings = { ...settings, ...updates }
        await pomodoro.saveSettings(newSettings)
        setSettings(newSettings)
    }, [settings])

    return { settings, loading, updateSettings }
}

/**
 * Hook for today's Pomodoro stats
 */
export function useTodayPomodoro() {
    const [sessionCount, setSessionCount] = useState(0)
    const [focusMinutes, setFocusMinutes] = useState(0)
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        const [count, minutes] = await Promise.all([
            pomodoro.getTodaySessionCount(),
            pomodoro.getTodayFocusMinutes(),
        ])
        setSessionCount(count)
        setFocusMinutes(minutes)
        setLoading(false)
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    return { sessionCount, focusMinutes, loading, refresh }
}

/**
 * Hook for Pomodoro timer functionality with Book Integration
 */
export function usePomodoroTimer() {
    const { settings } = usePomodoroSettings()
    const { user } = useAuth()
    const { refresh: refreshStats } = useTodayPomodoro()

    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [mode, setMode] = useState('work') // 'work' | 'short_break' | 'long_break'
    const [timeLeft, setTimeLeft] = useState(0)
    const [currentSession, setCurrentSession] = useState(null)
    const [focusLabel, setFocusLabel] = useState('')
    const [sessionsCompleted, setSessionsCompleted] = useState(0)

    // Reading mode state
    const [sessionMode, setSessionMode] = useState('general') // 'general' | 'reading'
    const [selectedBook, setSelectedBook] = useState(null)

    // Get duration based on mode
    const getDuration = useCallback((m) => {
        switch (m) {
            case 'work': return settings.work_duration * 60
            case 'short_break': return settings.short_break * 60
            case 'long_break': return settings.long_break * 60
            default: return settings.work_duration * 60
        }
    }, [settings])

    // Initialize timer
    useEffect(() => {
        if (!isRunning) {
            setTimeLeft(getDuration(mode))
        }
    }, [mode, getDuration, isRunning])

    // Wake lock for preventing screen sleep during focus
    useEffect(() => {
        if (isRunning && !isPaused && mode === 'work') {
            requestWakeLock()

            // Re-acquire on tab visibility change
            const visibilityHandler = () => handleVisibilityChange()
            document.addEventListener('visibilitychange', visibilityHandler)

            return () => {
                releaseWakeLock()
                document.removeEventListener('visibilitychange', visibilityHandler)
            }
        }
    }, [isRunning, isPaused, mode])

    // Timer countdown
    useEffect(() => {
        if (!isRunning || isPaused) return

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleTimerComplete()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [isRunning, isPaused])

    // Handle timer completion
    const handleTimerComplete = useCallback(async () => {
        if (mode === 'work' && currentSession) {
            // Log to book if reading mode
            let loggedToBook = false

            if (currentSession.session_mode === 'reading' && currentSession.book_id) {
                try {
                    // Create reading session
                    await createBookSession({
                        bookId: currentSession.book_id,
                        delta: currentSession.duration_minutes,
                        unit: 'minutes',
                        note: `Pomodoro: ${currentSession.focus_label || 'Sesi baca'}`,
                        source: 'pomodoro'
                    })

                    // Update book progress (optional - add to reading time tracking)
                    const book = await getBookById(currentSession.book_id)
                    if (book && book.progress?.unit === 'minutes') {
                        const currentProgress = book.progress?.current || 0
                        await updateBook(currentSession.book_id, {
                            progress: {
                                ...book.progress,
                                current: currentProgress + currentSession.duration_minutes
                            }
                        })
                    }

                    loggedToBook = true
                    console.log(`[Pomodoro] Logged ${currentSession.duration_minutes} min to book ${currentSession.book_id}`)
                } catch (error) {
                    console.error('[Pomodoro] Failed to log to book:', error)
                }
            }

            await pomodoro.completeSession(currentSession.id, loggedToBook)
            const newCount = sessionsCompleted + 1
            setSessionsCompleted(newCount)
            await refreshStats()

            // Determine next break
            if (newCount % settings.sessions_until_long_break === 0) {
                setMode('long_break')
            } else {
                setMode('short_break')
            }
        } else {
            // Break finished, back to work
            setMode('work')
        }

        setIsRunning(false)
        setIsPaused(false)
        setCurrentSession(null)

        // Fetch notification settings from Firestore (only when needed)
        let notificationSettings = null
        if (user?.uid) {
            try {
                const docRef = doc(db, 'notification_settings', user.uid)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    notificationSettings = docSnap.data()
                }
            } catch (error) {
                console.error('Failed to fetch notification settings:', error)
            }
        }

        // Default to enabled if no settings found
        const pomodoroEnabled = notificationSettings?.pomodoroNotifications?.enabled ?? true
        const workCompleteEnabled = notificationSettings?.pomodoroNotifications?.workComplete ?? true
        const breakCompleteEnabled = notificationSettings?.pomodoroNotifications?.breakComplete ?? true

        // Check if should show notification based on user settings
        const shouldNotify = pomodoroEnabled &&
            ((mode === 'work' && workCompleteEnabled) ||
             (mode === 'break' && breakCompleteEnabled))

        // Check quiet hours
        const isQuietHours = () => {
            if (!notificationSettings?.quietHours?.enabled) return false
            
            const now = new Date()
            const hour = now.getHours()
            const minute = now.getMinutes()
            const currentTime = hour * 60 + minute
            
            try {
                const [startHour, startMinute] = notificationSettings.quietHours.startTime.split(':').map(Number)
                const [endHour, endMinute] = notificationSettings.quietHours.endTime.split(':').map(Number)
                const startTime = startHour * 60 + startMinute
                const endTime = endHour * 60 + endMinute
                
                // Handle overnight quiet hours (e.g., 22:00 - 08:00)
                if (startTime > endTime) {
                    return currentTime >= startTime || currentTime < endTime
                }
                return currentTime >= startTime && currentTime < endTime
            } catch (error) {
                console.error('Failed to parse quiet hours:', error)
                return false
            }
        }

        // Optional: play notification sound (only if enabled and not in quiet hours)
        if (shouldNotify && !isQuietHours() && 'Notification' in window && Notification.permission === 'granted') {
            const body = mode === 'work'
                ? `Sesi selesai! ${currentSession?.session_mode === 'reading' ? 'Progress buku tercatat.' : ''} Waktunya istirahat.`
                : 'Break selesai! Siap fokus lagi?'
            
            try {
                // Always try Service Worker API first (PWA requirement)
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.ready
                    await registration.showNotification('Lento', {
                        body,
                        icon: '/Lento_Logo_Pack_Calm_v1/png/lento_icon_192.png'
                    })
                } else {
                    // Only use legacy API if Service Worker not supported at all
                    new Notification('Lento', {
                        body,
                        icon: '/Lento_Logo_Pack_Calm_v1/png/lento_icon_192.png'
                    })
                }
            } catch (error) {
                console.error('Failed to show notification:', error)
            }
        }
    }, [mode, currentSession, sessionsCompleted, settings, refreshStats, user?.uid])

    // Start timer
    const start = useCallback(async (label = '', book = null) => {
        const activeSessionMode = book ? 'reading' : sessionMode
        const activeBook = book || selectedBook

        if (mode === 'work') {
            const session = await pomodoro.createSession({
                duration_minutes: settings.work_duration,
                focus_label: label || focusLabel || (activeBook ? `Membaca: ${activeBook.title}` : ''),
                session_mode: activeSessionMode,
                book_id: activeBook?.id || null
            })
            setCurrentSession(session)
        }
        setFocusLabel(label || focusLabel)
        setTimeLeft(getDuration(mode))
        setIsRunning(true)
        setIsPaused(false)
    }, [mode, settings, focusLabel, getDuration, sessionMode, selectedBook])

    // Pause/resume
    const pause = useCallback(() => setIsPaused(true), [])
    const resume = useCallback(() => setIsPaused(false), [])

    // Stop/cancel
    const stop = useCallback(async () => {
        if (currentSession) {
            await pomodoro.deleteSession(currentSession.id)
        }
        setIsRunning(false)
        setIsPaused(false)
        setCurrentSession(null)
        setTimeLeft(getDuration(mode))
    }, [currentSession, getDuration, mode])

    // Skip current phase
    const skip = useCallback(async () => {
        await handleTimerComplete()
    }, [handleTimerComplete])

    // Reset to work mode
    const reset = useCallback(() => {
        setMode('work')
        setIsRunning(false)
        setIsPaused(false)
        setCurrentSession(null)
        setTimeLeft(getDuration('work'))
        setSessionMode('general')
        setSelectedBook(null)
    }, [getDuration])

    // Select book for reading mode
    const selectBook = useCallback((book) => {
        setSelectedBook(book)
        if (book) {
            setSessionMode('reading')
            setFocusLabel(`Membaca: ${book.title}`)
        } else {
            setSessionMode('general')
        }
    }, [])

    // Format time display
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    return {
        // State
        isRunning,
        isPaused,
        mode,
        timeLeft,
        timeDisplay: formatTime(timeLeft),
        focusLabel,
        sessionsCompleted,
        progress: 1 - (timeLeft / getDuration(mode)),

        // Reading mode state
        sessionMode,
        selectedBook,

        // Actions
        start,
        pause,
        resume,
        stop,
        skip,
        reset,
        setFocusLabel,
        setMode,

        // Book actions
        selectBook,
        setSessionMode,
    }
}

