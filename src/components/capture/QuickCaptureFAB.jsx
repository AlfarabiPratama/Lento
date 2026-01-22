import { IconPlus, IconX } from '@tabler/icons-react'
import { useQuickCapture } from '../../contexts/QuickCaptureContext'
import { useAppPrefs } from '../../hooks/useAppPrefs'

/**
 * QuickCaptureFAB - Floating Action Button for quick capture
 * Positioned above bottom nav with safe area support
 */
export function QuickCaptureFAB() {
    const { open, openCapture, closeCapture } = useQuickCapture()
    const { showQuickCaptureFab } = useAppPrefs()

    // Hide if disabled in settings
    if (!showQuickCaptureFab) return null

    const handleClick = () => {
        if (open) {
            closeCapture()
        } else {
            openCapture()
        }
    }

    return (
        <button
            onClick={handleClick}
            className={`
        fixed z-40 w-14 h-14 rounded-full shadow-lg
        flex items-center justify-center
        transition-all duration-200
        ${open
                    ? 'bg-ink text-white rotate-45'
                    : 'bg-primary text-white hover:bg-primary-dark hover:scale-105'
                }
        
        /* Position: above bottom nav with safe area */
        right-4 bottom-[calc(var(--bottom-nav-h)+16px+env(safe-area-inset-bottom,0px))]
        lg:bottom-8 lg:right-8
      `}
            aria-label={open ? 'Tutup' : 'Tambah cepat'}
        >
            <IconPlus
                size={24}
                stroke={2.5}
                className={`transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
            />
        </button>
    )
}

export default QuickCaptureFAB
