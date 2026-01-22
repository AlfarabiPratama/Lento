import { useState, useEffect } from 'react'
import { IconCloudCheck, IconLoader2, IconCloudOff } from '@tabler/icons-react'

/**
 * SyncIndicator - dengan Tabler Icons sesuai guideline
 * 
 * Icons: cloud-check / loader / cloud-off
 * Inline icon: 16-18px
 */
function SyncIndicator({ compact = false }) {
    const [status, setStatus] = useState('synced')

    useEffect(() => {
        const handleOnline = () => setStatus('synced')
        const handleOffline = () => setStatus('offline')

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        if (!navigator.onLine) {
            setStatus('offline')
        }

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    const statusConfig = {
        synced: {
            icon: IconCloudCheck,
            text: 'Tersinkron',
            // Quiet when synced
            iconClass: 'text-success/70',
            textClass: 'text-ink-soft',
            bgClass: 'bg-transparent',
            animate: false,
        },
        saving: {
            icon: IconLoader2,
            text: 'Menyimpan...',
            // Elevated when saving
            iconClass: 'text-secondary',
            textClass: 'text-secondary-dark',
            bgClass: 'bg-secondary/5',
            animate: true,
        },
        offline: {
            icon: IconCloudOff,
            text: 'Offline',
            // Noticeable when offline
            iconClass: 'text-ink-muted',
            textClass: 'text-ink-muted',
            bgClass: 'bg-paper-warm',
            animate: false,
        },
    }

    const current = statusConfig[status]
    const Icon = current.icon

    if (compact) {
        return (
            <span
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-caption ${current.bgClass}`}
                title={current.text}
                aria-label={current.text}
            >
                {/* Inline icon: 16px */}
                <Icon
                    size={16}
                    stroke={1.5}
                    className={`${current.iconClass} ${current.animate ? 'animate-spin' : ''}`}
                />
                <span className={`hidden sm:inline ${current.textClass}`}>{current.text}</span>
            </span>
        )
    }

    return (
        <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${current.bgClass}`}
            aria-label={current.text}
        >
            {/* Inline icon: 18px */}
            <Icon
                size={18}
                stroke={1.5}
                className={`${current.iconClass} ${current.animate ? 'animate-spin' : ''}`}
            />
            <span className={`text-small ${current.textClass}`}>{current.text}</span>
        </div>
    )
}

export default SyncIndicator
