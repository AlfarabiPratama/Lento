import { IconSwipe } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

/**
 * SwipeHint - Shows a visual hint that items are swipeable
 * Displays on first visit and fades out after 3 seconds
 */
export function SwipeHint({ storageKey = 'swipe-hint-seen' }) {
    const [show, setShow] = useState(false)

    useEffect(() => {
        // Check if user has seen the hint before
        const hasSeen = localStorage.getItem(storageKey)
        
        if (!hasSeen) {
            setShow(true)
            
            // Auto-hide after 3 seconds
            const timer = setTimeout(() => {
                setShow(false)
                localStorage.setItem(storageKey, 'true')
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [storageKey])

    if (!show) return null

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-ink text-surface px-4 py-3 rounded-full shadow-lg flex items-center gap-2">
                <IconSwipe size={20} className="animate-pulse" />
                <span className="text-small font-medium">Geser untuk aksi cepat</span>
            </div>
        </div>
    )
}
