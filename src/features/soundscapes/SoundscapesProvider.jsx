/**
 * Soundscapes Provider
 * 
 * Global audio controller for persistent ambient soundscapes.
 * 
 * CRITICAL RULES:
 * - Single <audio> instance (ref, not state)
 * - NEVER autoplay without user gesture (browser policy)
 * - ALWAYS await and catch play() Promise
 * - Handle NotAllowedError with blocked status
 * - Clean up on unmount (pause + null ref)
 * 
 * References:
 * - https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play
 * - https://developer.chrome.com/blog/autoplay
 */

import { createContext, useState, useRef, useEffect, useCallback } from 'react'
import { loadSoundPrefs, saveSoundPrefs, saveSoundPrefsDebounced } from './soundPrefs'
import { TRACKS, getTrackById } from './soundTracks'

export const SoundscapesContext = createContext(null)

export function SoundscapesProvider({ children }) {
    // Audio instance (ref for stability, NOT state)
    const audioRef = useRef(null)
    const wasPausedByHidden = useRef(false)

    // UI state
    const [isOpen, setIsOpen] = useState(false)
    const [trackId, setTrackId] = useState(null)
    const [volume, setVolume] = useState(0.5)
    const [pauseOnHidden, setPauseOnHidden] = useState(false)

    // Playback state
    const [status, setStatus] = useState('idle') // idle | loading | playing | paused | blocked | error
    const [lastError, setLastError] = useState(null)

    /**
     * Initialize audio instance and load preferences
     */
    useEffect(() => {
        // Create single audio instance
        audioRef.current = new Audio()
        audioRef.current.loop = true
        audioRef.current.preload = 'metadata' // Don't preload full file

        // Load saved preferences
        const prefs = loadSoundPrefs()
        setTrackId(prefs.trackId)
        setVolume(prefs.volume)
        setPauseOnHidden(prefs.pauseOnHidden)

        // Set initial track if saved
        if (prefs.trackId) {
            const track = getTrackById(prefs.trackId)
            if (track) {
                audioRef.current.src = track.src
            }
        }

        // Set initial volume
        audioRef.current.volume = prefs.volume

        // Error handling
        const handleError = () => {
            if (!audioRef.current || !audioRef.current.error) return

            const errorMap = {
                1: 'Download dibatalkan.',
                2: 'Koneksi terputus. Coba lagi?',
                3: 'File audio rusak.',
                4: 'Format tidak didukung.',
            }

            const code = audioRef.current.error.code
            const message = errorMap[code] || 'Gagal memutar audio.'

            setStatus('error')
            setLastError(message)
        }

        audioRef.current.addEventListener('error', handleError)

        // Cleanup on unmount
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.removeEventListener('error', handleError)
                audioRef.current = null
            }
        }
    }, [])

    /**
     * Visibility API: Pause on hidden (if enabled)
     * Default MVP: Continue playing (ambient nature)
     * User can toggle "Pause saat pindah tab" preference
     */
    useEffect(() => {
        if (!pauseOnHidden) return

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && status === 'playing') {
                audioRef.current?.pause()
                wasPausedByHidden.current = true
            } else if (document.visibilityState === 'visible' && wasPausedByHidden.current) {
                // Try to resume (might fail if browser blocks)
                audioRef.current?.play().catch(() => {
                    setStatus('paused')
                    // Silent fail - user can manually resume
                })
                wasPausedByHidden.current = false
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [pauseOnHidden, status])

    /**
     * Unlock and play audio (autoplay-safe)
     * 
     * CRITICAL: This must be called from user gesture (click, keypress)
     * Browser will reject play() without interaction
     */
    const unlockAndPlay = useCallback(async () => {
        if (!audioRef.current) {
            setLastError('Audio tidak tersedia.')
            return
        }

        if (!audioRef.current.src) {
            setLastError('Pilih track dulu.')
            return
        }

        try {
            setStatus('loading')
            setLastError(null)

            // CRITICAL: await play() - can reject!
            await audioRef.current.play()

            setStatus('playing')
            setLastError(null)
        } catch (error) {
            console.warn('Play failed:', error)

            // Handle specific error types
            if (error.name === 'NotAllowedError') {
                // Browser blocked autoplay (expected on first try)
                setStatus('blocked')
                setLastError('Klik Play untuk mengaktifkan audio 🔊')
            } else if (error.name === 'NotSupportedError') {
                setStatus('error')
                setLastError('Browser tidak support format ini.')
            } else {
                setStatus('error')
                setLastError('Gagal memutar. Coba lagi?')
            }
        }
    }, [])

    /**
     * Pause audio
     */
    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause()
            setStatus('paused')
        }
    }, [])

    /**
     * Set track and optionally auto-resume if playing
     */
    const handleSetTrack = useCallback((newTrackId) => {
        const track = getTrackById(newTrackId)
        if (!track) {
            console.error('Track not found:', newTrackId)
            return
        }

        const wasPlaying = status === 'playing'

        // Pause current track
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.src = track.src
        }

        setTrackId(newTrackId)

        // Auto-resume if was playing
        if (wasPlaying) {
            unlockAndPlay()
        }

        // Save preference
        saveSoundPrefs({
            trackId: newTrackId,
            volume,
            pauseOnHidden,
        })
    }, [status, volume, pauseOnHidden, unlockAndPlay])

    /**
     * Set volume (0-1)
     */
    const handleSetVolume = useCallback((newVolume) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume))

        if (audioRef.current) {
            audioRef.current.volume = clampedVolume
        }

        setVolume(clampedVolume)

        // Debounced save (for slider drag)
        saveSoundPrefsDebounced({
            trackId,
            volume: clampedVolume,
            pauseOnHidden,
        })
    }, [trackId, pauseOnHidden])

    /**
     * Toggle pause on hidden preference
     */
    const handleSetPauseOnHidden = useCallback((enabled) => {
        setPauseOnHidden(enabled)

        saveSoundPrefs({
            trackId,
            volume,
            pauseOnHidden: enabled,
        })
    }, [trackId, volume])

    /**
     * Panel controls
     */
    const openPanel = useCallback(() => setIsOpen(true), [])
    const closePanel = useCallback(() => setIsOpen(false), [])

    /**
     * Context value
     */
    const value = {
        // Panel state
        isOpen,
        openPanel,
        closePanel,

        // Playback state
        status,
        trackId,
        volume,
        pauseOnHidden,
        lastError,

        // Playback controls
        unlockAndPlay,
        pause,
        setTrack: handleSetTrack,
        setVolume: handleSetVolume,
        setPauseOnHidden: handleSetPauseOnHidden,
    }

    return (
        <SoundscapesContext.Provider value={value}>
            {children}
        </SoundscapesContext.Provider>
    )
}

export default SoundscapesProvider
