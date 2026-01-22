/**
 * Soundscapes Floating Action Button
 * 
 * Global FAB for soundscapes control.
 * Positioned above QuickCapture FAB to avoid collision.
 * 
 * States:
 * - Idle: Headphones icon, gray
 * - Playing: Volume icon, primary color, pulse animation
 * - Blocked: Warning dot indicator
 * - Error: X indicator
 */

import { IconHeadphones, IconVolume, IconAlertCircle } from '@tabler/icons-react'
import { useSoundscapes } from './useSoundscapes'
import { useAppPrefs } from '../../hooks/useAppPrefs'

export function SoundFab() {
    const { isOpen, openPanel, closePanel, status } = useSoundscapes()
    const { showSoundscapesFab } = useAppPrefs()

    // Hide if disabled in settings
    if (!showSoundscapesFab) return null

    const handleClick = () => {
        if (isOpen) {
            closePanel()
        } else {
            openPanel()
        }
    }

    // Determine icon and styling based on status
    const getIcon = () => {
        if (status === 'playing') {
            return <IconVolume size={24} />
        }
        return <IconHeadphones size={24} />
    }

    const getAriaLabel = () => {
        if (isOpen) return 'Tutup panel soundscapes'
        if (status === 'playing') return 'Buka panel soundscapes (sedang memutar)'
        if (status === 'blocked') return 'Buka panel soundscapes (perlu aktivasi)'
        if (status === 'error') return 'Buka panel soundscapes (ada error)'
        return 'Buka panel soundscapes'
    }

    return (
        <div className="fixed right-4 lg:right-8 z-40 bottom-[calc(var(--bottom-nav-h)+100px+env(safe-area-inset-bottom,0px))] lg:bottom-[calc(72px+24px)]">
            <button
                onClick={handleClick}
                className={`
          relative w-14 h-14 rounded-full shadow-lg
          flex items-center justify-center
          transition-all duration-200 ease-out
          ${status === 'playing'
                        ? 'bg-primary text-white animate-pulse'
                        : 'bg-paper border-2 border-line text-ink hover:border-primary/50'
                    }
          ${isOpen ? 'scale-95' : 'scale-100 hover:scale-105'}
        `}
                aria-label={getAriaLabel()}
                aria-pressed={isOpen}
            >
                {getIcon()}

                {/* Status indicator dot */}
                {status === 'blocked' && (
                    <span
                        className="absolute top-0 right-0 w-3 h-3 bg-warning rounded-full border-2 border-paper"
                        aria-hidden="true"
                    />
                )}

                {status === 'error' && (
                    <span
                        className="absolute top-0 right-0 w-3 h-3 bg-danger rounded-full border-2 border-paper"
                        aria-hidden="true"
                    />
                )}

                {/* Ripple effect for playing state */}
                {status === 'playing' && (
                    <span
                        className="absolute inset-0 rounded-full bg-primary opacity-20 animate-ping"
                        aria-hidden="true"
                    />
                )}
            </button>
        </div>
    )
}

export default SoundFab
