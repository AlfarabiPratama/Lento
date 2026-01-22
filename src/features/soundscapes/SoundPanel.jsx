/**
 * Soundscapes Control Panel
 * 
 * Modal panel for soundscapes controls:
 * - Track selection
 * - Play/Pause button
 * - Volume slider
 * - Pause on hidden toggle
 * - Status messages
 * 
 * Accessibility:
 * - Focus trap (Tab stays inside)
 * - Esc closes panel
 * - Returns focus to FAB on close
 * - ARIA labels for all controls
 */

import { useEffect, useRef } from 'react'
import {
    IconPlayerPlay,
    IconPlayerPause,
    IconVolume,
    IconX,
    IconAlertCircle,
} from '@tabler/icons-react'
import { useSoundscapes } from './useSoundscapes'
import { TRACKS } from './soundTracks'
import { SoundRow } from './SoundRow'

export function SoundPanel() {
    const {
        isOpen,
        closePanel,
        status,
        trackId,
        volume,
        pauseOnHidden,
        lastError,
        unlockAndPlay,
        pause,
        setTrack,
        setVolume,
        setPauseOnHidden,
    } = useSoundscapes()

    const panelRef = useRef(null)
    const closeButtonRef = useRef(null)

    /**
     * Focus trap: Keep focus inside panel when open
     */
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closePanel()
                return
            }

            // Focus trap logic
            if (e.key === 'Tab') {
                const focusableElements = panelRef.current?.querySelectorAll(
                    'button, input[type="range"], input[type="checkbox"]'
                )

                if (!focusableElements || focusableElements.length === 0) return

                const firstElement = focusableElements[0]
                const lastElement = focusableElements[focusableElements.length - 1]

                if (e.shiftKey) {
                    // Shift+Tab: wrap to last if at first
                    if (document.activeElement === firstElement) {
                        e.preventDefault()
                        lastElement.focus()
                    }
                } else {
                    // Tab: wrap to first if at last
                    if (document.activeElement === lastElement) {
                        e.preventDefault()
                        firstElement.focus()
                    }
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        // Focus close button on open
        closeButtonRef.current?.focus()

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, closePanel])

    /**
     * Click outside to close
     */
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            closePanel()
        }
    }

    if (!isOpen) return null

    const isPlaying = status === 'playing'
    const isLoading = status === 'loading'
    const isBlocked = status === 'blocked'
    const isError = status === 'error'

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center bg-black/20 backdrop-blur-sm"
            onClick={handleBackdropClick}
            role="presentation"
        >
            <div
                ref={panelRef}
                className="
          w-full max-w-md bg-paper rounded-t-2xl sm:rounded-2xl
          shadow-2xl border border-line
          max-h-[90vh] overflow-y-auto
          animate-slide-up
        "
                role="dialog"
                aria-modal="true"
                aria-labelledby="soundscapes-title"
                aria-describedby="soundscapes-description"
            >
                {/* Header */}
                <div className="sticky top-0 bg-paper border-b border-line p-4 flex items-center justify-between">
                    <div>
                        <h2 id="soundscapes-title" className="text-h3 text-ink font-semibold">
                            Soundscapes
                        </h2>
                        <p id="soundscapes-description" className="text-tiny text-ink-muted">
                            Ambient suara untuk fokus
                        </p>
                    </div>

                    <button
                        ref={closeButtonRef}
                        onClick={closePanel}
                        className="p-2 rounded-lg hover:bg-surface transition-colors"
                        aria-label="Tutup panel"
                    >
                        <IconX size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-6">
                    {/* Track selection */}
                    <div>
                        <label className="text-small font-medium text-ink-muted mb-2 block">
                            Pilih Suara
                        </label>
                        <div className="space-y-2" role="radiogroup" aria-label="Pilih track soundscape">
                            {TRACKS.map((track) => (
                                <SoundRow
                                    key={track.id}
                                    track={track}
                                    active={trackId === track.id}
                                    onClick={() => setTrack(track.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Play/Pause button */}
                    <div>
                        <button
                            onClick={isPlaying ? pause : unlockAndPlay}
                            disabled={isLoading || !trackId}
                            className={`
                w-full py-4 rounded-xl font-medium text-body
                flex items-center justify-center gap-2
                transition-all duration-200
                ${isPlaying
                                    ? 'bg-primary/10 text-primary border-2 border-primary hover:bg-primary/20'
                                    : 'bg-primary text-white hover:bg-primary-dark'
                                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
                            aria-label={isPlaying ? 'Pause soundscape' : 'Play soundscape'}
                        >
                            {isLoading ? (
                                <>
                                    <IconVolume size={20} className="animate-spin" />
                                    <span>Memuat...</span>
                                </>
                            ) : isPlaying ? (
                                <>
                                    <IconPlayerPause size={20} />
                                    <span>Pause</span>
                                </>
                            ) : (
                                <>
                                    <IconPlayerPlay size={20} />
                                    <span>Play</span>
                                </>
                            )}
                        </button>

                        {!trackId && (
                            <p className="text-tiny text-ink-muted mt-2 text-center">
                                Pilih track dulu
                            </p>
                        )}
                    </div>

                    {/* Status message (blocked/error) */}
                    {(isBlocked || isError) && lastError && (
                        <div
                            className={`
                flex items-start gap-2 p-3 rounded-xl
                ${isBlocked ? 'bg-warning/5 border border-warning/20' : 'bg-danger/5 border border-danger/20'}
              `}
                            role="alert"
                            aria-live="polite"
                        >
                            <IconAlertCircle
                                size={16}
                                className={`flex-shrink-0 mt-0.5 ${isBlocked ? 'text-warning' : 'text-danger'}`}
                            />
                            <div className="flex-1 min-w-0">
                                <p className={`text-small font-medium ${isBlocked ? 'text-warning' : 'text-danger'}`}>
                                    {isBlocked ? 'Perlu Aktivasi' : 'Error'}
                                </p>
                                <p className={`text-tiny ${isBlocked ? 'text-warning/90' : 'text-danger/90'}`}>
                                    {lastError}
                                </p>
                            </div>
                            {isError && (
                                <button
                                    onClick={unlockAndPlay}
                                    className="text-tiny px-3 py-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 flex-shrink-0"
                                >
                                    Coba Lagi
                                </button>
                            )}
                        </div>
                    )}

                    {/* Volume slider */}
                    <div>
                        <label htmlFor="volume-slider" className="text-small font-medium text-ink-muted mb-2 flex items-center justify-between">
                            <span>Volume</span>
                            <span className="text-tiny">{Math.round(volume * 100)}%</span>
                        </label>
                        <div className="flex items-center gap-3">
                            <IconVolume size={16} className="text-ink-muted flex-shrink-0" />
                            <input
                                id="volume-slider"
                                type="range"
                                min="0"
                                max="100"
                                value={volume * 100}
                                onChange={(e) => setVolume(Number(e.target.value) / 100)}
                                className="flex-1 h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                                aria-label="Volume slider"
                                aria-valuemin="0"
                                aria-valuemax="100"
                                aria-valuenow={Math.round(volume * 100)}
                                aria-valuetext={`${Math.round(volume * 100)} persen`}
                            />
                        </div>
                    </div>

                    {/* Pause on hidden toggle */}
                    <div className="pt-4 border-t border-line">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={pauseOnHidden}
                                onChange={(e) => setPauseOnHidden(e.target.checked)}
                                className="w-5 h-5 accent-primary cursor-pointer"
                                aria-label="Pause saat pindah tab"
                            />
                            <div className="flex-1">
                                <p className="text-body text-ink">Pause saat pindah tab</p>
                                <p className="text-tiny text-ink-muted">
                                    Hemat baterai dengan pause otomatis
                                </p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SoundPanel
